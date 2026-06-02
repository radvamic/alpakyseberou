import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(photos)
      .where(eq(photos.type, 'table-challenge'))
      .orderBy(desc(photos.createdAt))
      .all();

    const byGuestMap = new Map<
      string,
      { name: string; photos: typeof rows }
    >();

    for (const photo of rows) {
      const name = (photo.name || 'Anonym').trim() || 'Anonym';
      const existing = byGuestMap.get(name);
      if (existing) {
        existing.photos.push(photo);
      } else {
        byGuestMap.set(name, { name, photos: [photo] });
      }
    }

    const guests = Array.from(byGuestMap.values()).sort(
      (a, b) => b.photos.length - a.photos.length,
    );

    const uniqueParticipants = guests.length;
    const totalPhotos = rows.length;
    const withProof = guests.filter((g) => g.photos.length > 0).length;

    return NextResponse.json({
      stats: {
        totalPhotos,
        uniqueParticipants,
        withProof,
        avgPhotosPerGuest:
          uniqueParticipants > 0
            ? Math.round((totalPhotos / uniqueParticipants) * 10) / 10
            : 0,
      },
      guests,
      photos: rows,
    });
  } catch (error) {
    console.error('Admin table-challenge GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
