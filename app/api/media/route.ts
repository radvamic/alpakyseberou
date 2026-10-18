import { NextRequest, NextResponse } from 'next/server';
import { ne } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { isAdmin } from '@/lib/admin-auth';
import { deviceHash } from '@/lib/media/access';
import type { MediaListResponse } from '@/lib/media/shared';

/** Celá galerie — rozpracovaná nahrávání se nevrací. */
export async function GET(request: NextRequest) {
  try {
    const device = deviceHash(request);
    const rows = await db
      .select({
        uid: media.uid,
        guestName: media.guestName,
        guestKey: media.guestKey,
        deviceHash: media.deviceHash,
        kind: media.kind,
        collection: media.collection,
        status: media.status,
        fileName: media.fileName,
        size: media.size,
        width: media.width,
        height: media.height,
        durationMs: media.durationMs,
        takenAt: media.takenAt,
        uploadedAt: media.uploadedAt,
        thumbKey: media.thumbKey,
      })
      .from(media)
      .where(ne(media.status, 'uploading'))
      .orderBy(media.id)
      .all();

    const body: MediaListResponse = {
      isAdmin: isAdmin(request),
      items: rows.map(({ deviceHash: owner, thumbKey, status, ...row }) => ({
        ...row,
        status: status === 'ready' ? 'ready' : 'processing',
        hasThumb: !!thumbKey,
        mine: !!device && owner === device,
      })),
    };
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
