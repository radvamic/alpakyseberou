import { NextResponse } from 'next/server';
import { computePublicProgress } from '@/lib/quiz-server';

/** Veřejný průběh kvízu — bez správných odpovědí a bez skóre. */
export async function GET() {
  try {
    return NextResponse.json(computePublicProgress());
  } catch (error) {
    console.error('Quiz progress GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
