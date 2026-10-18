import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { isAdmin } from '@/lib/admin-auth';
import { deviceHash, forbidden, hasMediaAccess } from '@/lib/media/access';
import { abortMultipart, deleteObjects } from '@/lib/media/r2';
import { findMedia, storedKeys } from '@/lib/media/server';

/** Smazání — smí ten, kdo soubor nahrál (stejný telefon), nebo admin. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  if (!hasMediaAccess(request)) return forbidden();

  try {
    const { uid } = await params;
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
