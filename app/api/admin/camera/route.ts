import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cameraSessions, cameraPhotos } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';
import { deletePhotoFile } from '@/lib/delete-stored-photo';

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

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const idParam = request.nextUrl.searchParams.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const photo = await db.select().from(cameraPhotos).where(eq(cameraPhotos.id, id)).get();

    if (!photo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    deletePhotoFile(photo.url);
    if (photo.thumbnailUrl) deletePhotoFile(photo.thumbnailUrl);

    await db.delete(cameraPhotos).where(eq(cameraPhotos.id, id));

    // Decrement session counter
    await db
      .update(cameraSessions)
      .set({ photosTaken: sql`MAX(0, ${cameraSessions.photosTaken} - 1)` })
      .where(eq(cameraSessions.id, photo.sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin camera DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
