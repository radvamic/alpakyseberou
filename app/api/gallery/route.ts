import { NextResponse } from 'next/server';
import { db } from '@/db';
import { photos, cameraSessions, cameraPhotos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const guests = await db
      .select()
      .from(photos)
      .where(eq(photos.type, 'wedding'))
      .orderBy(desc(photos.createdAt))
      .all();

    const tableChallenge = await db
      .select()
      .from(photos)
      .where(eq(photos.type, 'table-challenge'))
      .orderBy(desc(photos.createdAt))
      .all();

    const sessions = await db
      .select()
      .from(cameraSessions)
      .orderBy(desc(cameraSessions.createdAt))
      .all();

    const camera = await Promise.all(
      sessions.map(async (session) => {
        const sessionPhotos = await db
          .select()
          .from(cameraPhotos)
          .where(eq(cameraPhotos.sessionId, session.id))
          .orderBy(desc(cameraPhotos.createdAt))
          .all();
        return {
          id: session.id,
          guestName: session.guestName,
          photosTaken: session.photosTaken,
          maxPhotos: session.maxPhotos,
          createdAt: session.createdAt,
          photos: sessionPhotos.map((p) => ({
            id: p.id,
            url: p.url,
            thumbnailUrl: p.thumbnailUrl || p.url,
            createdAt: p.createdAt,
          })),
        };
      }),
    );

    const cameraWithPhotos = camera.filter((s) => s.photos.length > 0);

    return NextResponse.json({
      guests,
      tableChallenge,
      camera: cameraWithPhotos,
    });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
