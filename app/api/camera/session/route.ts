import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cameraSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { guestIdentitySchema, identityKey } from '@/lib/guest-identity';

type CameraSession = typeof cameraSessions.$inferSelect;

function sessionResponse(session: CameraSession) {
  return NextResponse.json({
    token: session.token,
    photosTaken: session.photosTaken,
    maxPhotos: session.maxPhotos,
    guestName: session.guestName,
    guestSurname: session.guestSurname,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = guestIdentitySchema.safeParse({
      firstName: body.name,
      lastName: body.surname,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Name and surname are required' }, { status: 400 });
    }

    const { firstName, lastName } = parsed.data;
    const key = identityKey(firstName, lastName);

    // Stejné jméno + příjmení (bez ohledu na velikost písmen a diakritiku)
    // = stejný film, i z jiného telefonu. Jmenovci s jiným příjmením mají
    // každý svůj film.
    const existing = await db
      .select()
      .from(cameraSessions)
      .where(eq(cameraSessions.identityKey, key))
      .get();

    if (existing) {
      return sessionResponse(existing);
    }

    const session = await db
      .insert(cameraSessions)
      .values({ token: randomUUID(), guestName: firstName, guestSurname: lastName, identityKey: key })
      .returning()
      .get();

    return sessionResponse(session);
  } catch (error) {
    console.error('Camera session POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const session = await db
      .select()
      .from(cameraSessions)
      .where(eq(cameraSessions.token, token))
      .get();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return sessionResponse(session);
  } catch (error) {
    console.error('Camera session GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
