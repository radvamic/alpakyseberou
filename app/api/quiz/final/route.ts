import { NextResponse } from 'next/server';
import { computeResults } from '@/lib/quiz-server';
import { QUIZ_CLOSED, type QuizFinalResults } from '@/lib/quiz-types';

/** Konečné výsledky pro úvodní stránku — správné odpovědi a pořadí, až po uzavření kvízu. */
export async function GET() {
  if (!QUIZ_CLOSED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const results = computeResults();
    const numberById = new Map(results.questions.map((q) => [q.id, q.number]));
    const body: QuizFinalResults = {
      questions: results.questions.map((q) => ({
        number: q.number,
        questionCs: q.questionCs,
        questionEn: q.questionEn,
        options: q.options,
        correctOption: q.correctOption,
        answeredCount: q.answeredCount,
        correctCount: q.correctCount,
      })),
      players: results.players.map(({ name, correct, answers }) => ({
        name,
        correct,
        answers: Object.fromEntries(
          Object.entries(answers).map(([questionId, option]) => [numberById.get(Number(questionId)), option]),
        ),
      })),
    };
    return NextResponse.json(body);
  } catch (error) {
    console.error('Quiz final GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
