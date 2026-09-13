import { asc, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { quizAnswers, quizPlayers, quizQuestions } from '@/db/schema';
import { formatGuestName } from '@/lib/guest-identity';
import type {
  QuizAnswerMap,
  QuizPlayerState,
  QuizPublicProgress,
  QuizResultPlayer,
  QuizResults,
} from '@/lib/quiz-types';

type QuizPlayer = typeof quizPlayers.$inferSelect;

export function findPlayerByToken(token: string): QuizPlayer | undefined {
  return db.select().from(quizPlayers).where(eq(quizPlayers.token, token)).get();
}

function answerMapFor(playerId: number): QuizAnswerMap {
  const rows = db
    .select({ questionId: quizAnswers.questionId, selectedOption: quizAnswers.selectedOption })
    .from(quizAnswers)
    .where(eq(quizAnswers.playerId, playerId))
    .all();
  return Object.fromEntries(rows.map((row) => [row.questionId, row.selectedOption]));
}

export function playerState(player: QuizPlayer): QuizPlayerState {
  return {
    token: player.token,
    firstName: player.firstName,
    lastName: player.lastName,
    answers: answerMapFor(player.id),
  };
}

/**
 * Veřejný průběh: kdo hraje a kolik otázek zodpověděl. Záměrně nic
 * o správnosti — odpovědi jdou měnit, takže i pouhé skóre by hostům
 * prozradilo, kdy se trefili.
 */
export function computePublicProgress(): QuizPublicProgress {
  const total = db.select({ value: count() }).from(quizQuestions).get()?.value ?? 0;

  const players = db
    .select({
      id: quizPlayers.id,
      firstName: quizPlayers.firstName,
      lastName: quizPlayers.lastName,
      answered: count(quizAnswers.id),
    })
    .from(quizPlayers)
    .leftJoin(quizAnswers, eq(quizAnswers.playerId, quizPlayers.id))
    .groupBy(quizPlayers.id)
    .all()
    .map((p) => ({ id: p.id, name: formatGuestName(p.firstName, p.lastName), answered: p.answered }));

  players.sort((a, b) => b.answered - a.answered || a.name.localeCompare(b.name, 'cs'));

  return { total, players };
}

/**
 * Pořadí a statistiky pro organizátory. Správnost se počítá až tady, při čtení. Když admin
 * opraví správnou odpověď, výsledky se okamžitě přepočítají.
 */
export function computeResults(): QuizResults {
  const questions = db.select().from(quizQuestions).orderBy(asc(quizQuestions.number)).all();
  const players = db.select().from(quizPlayers).all();
  const answers = db.select().from(quizAnswers).all();

  const correctOptionById = new Map(questions.map((q) => [q.id, q.correctOption]));
  const questionStats = new Map(questions.map((q) => [q.id, { answered: 0, correct: 0 }]));

  const rows = players.map((p) => ({
    id: p.id,
    name: formatGuestName(p.firstName, p.lastName),
    answered: 0,
    correct: 0,
    cells: {} as Record<number, boolean>,
    lastAnswerAt: '',
  }));
  const rowById = new Map(rows.map((row) => [row.id, row]));

  for (const answer of answers) {
    const row = rowById.get(answer.playerId);
    const correctOption = correctOptionById.get(answer.questionId);
    if (!row || correctOption === undefined) continue;

    const isCorrect = answer.selectedOption === correctOption;
    row.cells[answer.questionId] = isCorrect;
    row.answered += 1;
    if (isCorrect) row.correct += 1;
    if (answer.updatedAt > row.lastAnswerAt) row.lastAnswerAt = answer.updatedAt;

    const stats = questionStats.get(answer.questionId)!;
    stats.answered += 1;
    if (isCorrect) stats.correct += 1;
  }

  // Víc správně > víc zodpovězeno > dřív hotovo.
  rows.sort(
    (a, b) =>
      b.correct - a.correct ||
      b.answered - a.answered ||
      a.lastAnswerAt.localeCompare(b.lastAnswerAt) ||
      a.name.localeCompare(b.name, 'cs'),
  );

  return {
    questions: questions.map((q) => ({
      id: q.id,
      number: q.number,
      questionCs: q.questionCs,
      questionEn: q.questionEn,
      options: q.options,
      correctOption: q.correctOption,
      answeredCount: questionStats.get(q.id)!.answered,
      correctCount: questionStats.get(q.id)!.correct,
    })),
    players: rows.map(
      ({ id, name, answered, correct, cells }): QuizResultPlayer => ({
        id,
        name,
        answered,
        correct,
        cells,
      }),
    ),
  };
}
