import { NextRequest, NextResponse } from 'next/server';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { quizQuestions } from '@/db/schema';
import type { QuizPublicQuestion } from '@/lib/quiz-types';

/** Jedna otázka pro hosty. Správnou odpověď záměrně neposílá. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const number = Number((await params).number);
    if (!Number.isInteger(number)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const question = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.number, number))
      .get();

    if (!question) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const total = (await db.select({ value: count() }).from(quizQuestions).get())?.value ?? 0;

    const body: QuizPublicQuestion = {
      id: question.id,
      number: question.number,
      imageUrl: question.imageUrl,
      questionCs: question.questionCs,
      questionEn: question.questionEn,
      options: question.options,
      total,
    };

    return NextResponse.json(body);
  } catch (error) {
    console.error('Quiz question GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
