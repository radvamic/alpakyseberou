import { NextRequest, NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { quizPlayers, quizQuestions } from '@/db/schema';
import { canManageQuiz, getOrganizerPath } from '@/lib/quiz-organizer';
import { computeResults } from '@/lib/quiz-server';
import type { QuizAdminData } from '@/lib/quiz-types';

export async function GET(request: NextRequest) {
  if (!canManageQuiz(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questions = await db
      .select()
      .from(quizQuestions)
      .orderBy(asc(quizQuestions.number))
      .all();

    const players = await db
      .select()
      .from(quizPlayers)
      .orderBy(desc(quizPlayers.createdAt), desc(quizPlayers.id))
      .all();

    const scoreById = new Map(computeResults().players.map((p) => [p.id, p]));

    const body: QuizAdminData = {
      questions: questions.map((q) => ({
        id: q.id,
        number: q.number,
        imageUrl: q.imageUrl,
        questionCs: q.questionCs,
        questionEn: q.questionEn,
        options: q.options,
        correctOption: q.correctOption,
      })),
      players: players.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        createdAt: p.createdAt,
        answered: scoreById.get(p.id)?.answered ?? 0,
        correct: scoreById.get(p.id)?.correct ?? 0,
      })),
      organizerPath: getOrganizerPath(),
    };

    return NextResponse.json(body);
  } catch (error) {
    console.error('Admin quiz GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
