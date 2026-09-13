import { NextRequest, NextResponse } from 'next/server';
import { isOrganizerKey } from '@/lib/quiz-organizer';
import { computeResults } from '@/lib/quiz-server';

/** Plné výsledky pro organizátory — jen se správným klíčem z adminu. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    if (!isOrganizerKey((await params).key)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(computeResults());
  } catch (error) {
    console.error('Quiz results GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
