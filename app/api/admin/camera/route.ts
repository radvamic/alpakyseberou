import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cameraSessions, cameraPhotos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await db.select().from(cameraSessions).all();

    const sessionsWithPhotos = await Promise.all(
      sessions.map(async (session) => {
        const photos = await db
          .select()
          .from(cameraPhotos)
          .where(eq(cameraPhotos.sessionId, session.id))
          .all();
        return { ...session, photos };
      }),
    );

    return NextResponse.json(sessionsWithPhotos);
  } catch (error) {
    console.error('Admin camera GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
