import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { quizAnswers, quizQuestions } from '@/db/schema';
import { findPlayerByToken, playerState } from '@/lib/quiz-server';

const answerSchema = z.object({
  token: z.string().min(1),
  questionId: z.number().int().positive(),
  option: z.number().int().min(0),
});

/** Uloží odpověď. Opakované odeslání odpověď přepíše (host ji může změnit). */
export async function POST(request: NextRequest) {
  try {
    const parsed = answerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { token, questionId, option } = parsed.data;

    const player = findPlayerByToken(token);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const question = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, questionId))
      .get();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    if (option >= question.options.length) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    await db
      .insert(quizAnswers)
      .values({ playerId: player.id, questionId, selectedOption: option })
      .onConflictDoUpdate({
        target: [quizAnswers.playerId, quizAnswers.questionId],
        set: { selectedOption: option, updatedAt: sql`(datetime('now'))` },
      });

    return NextResponse.json(playerState(player));
  } catch (error) {
    console.error('Quiz answer POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
