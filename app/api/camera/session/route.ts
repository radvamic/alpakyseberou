import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cameraSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find existing session for this name (case-insensitive)
    const existing = await db
      .select()
      .from(cameraSessions)
      .where(eq(cameraSessions.guestName, name))
      .get();

    if (existing) {
      return NextResponse.json({
        token: existing.token,
        photosTaken: existing.photosTaken,
        maxPhotos: existing.maxPhotos,
        guestName: existing.guestName,
      });
    }

    const token = randomUUID();
    const session = await db
      .insert(cameraSessions)
      .values({ token, guestName: name })
      .returning()
      .get();

    return NextResponse.json({
      token: session.token,
      photosTaken: session.photosTaken,
      maxPhotos: session.maxPhotos,
      guestName: session.guestName,
    });
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

    return NextResponse.json({
      token: session.token,
      photosTaken: session.photosTaken,
      maxPhotos: session.maxPhotos,
      guestName: session.guestName,
    });
  } catch (error) {
    console.error('Camera session GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
