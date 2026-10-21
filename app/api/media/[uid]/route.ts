import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { isAdmin } from '@/lib/admin-auth';
import { deviceHash } from '@/lib/media/access';
import { deleteCameraPhoto, findCameraPhoto } from '@/lib/media/camera';
import { abortMultipart, deleteObjects } from '@/lib/media/r2';
import { findMedia, storedKeys } from '@/lib/media/server';
import { cameraPhotoId } from '@/lib/media/shared';

/**
 * Smazání — smí ten, kdo soubor nahrál (stejný telefon), nebo admin.
 * Snímky z jednorázového fotoaparátu maže jen admin.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;
    const cameraId = cameraPhotoId(uid);
    if (cameraId !== null) {
      if (!isAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const found = await findCameraPhoto(cameraId);
      if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      await deleteCameraPhoto(found.photo);
      return NextResponse.json({ ok: true });
    }

    const row = await findMedia(uid);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!isAdmin(request) && row.deviceHash !== deviceHash(request)) {
      return NextResponse.json({ error: 'Smazat může jen ten, kdo soubor nahrál.' }, { status: 403 });
    }

    if (row.uploadId) await abortMultipart(row.originalKey, row.uploadId);
    await deleteObjects(storedKeys(row));
    await db.delete(media).where(eq(media.id, row.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
