import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { quizQuestions } from '@/db/schema';

/** Seznam stanovišť pro mapu a progres (bez obsahu otázek). */
export async function GET() {
  try {
    const questions = await db
      .select({ id: quizQuestions.id, number: quizQuestions.number })
      .from(quizQuestions)
      .orderBy(asc(quizQuestions.number))
      .all();

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Quiz questions GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
