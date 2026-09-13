import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { quizPlayers } from '@/db/schema';
import { guestIdentitySchema, identityKey } from '@/lib/guest-identity';
import { findPlayerByToken, playerState } from '@/lib/quiz-server';

/**
 * Přihlášení hráče jménem a příjmením. Stejná dvojice (bez ohledu na
 * velikost písmen a diakritiku) = stejný hráč i na jiném telefonu.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = guestIdentitySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Jméno i příjmení jsou povinné' }, { status: 400 });
    }

    const { firstName, lastName } = parsed.data;
    const key = identityKey(firstName, lastName);

    // Při souběžném přihlášení stejného hosta vyhraje první insert,
    // druhý se jen dohledá.
    await db
      .insert(quizPlayers)
      .values({ token: randomUUID(), firstName, lastName, identityKey: key })
      .onConflictDoNothing({ target: quizPlayers.identityKey });

    const player = await db
      .select()
      .from(quizPlayers)
      .where(eq(quizPlayers.identityKey, key))
      .get();

    if (!player) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json(playerState(player));
  } catch (error) {
    console.error('Quiz player POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const player = findPlayerByToken(token);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json(playerState(player));
  } catch (error) {
    console.error('Quiz player GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
