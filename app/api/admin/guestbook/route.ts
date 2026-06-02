import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guestbookEntries, photos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';
import { deletePhotoFile } from '@/lib/delete-stored-photo';

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

    const entry = await db
      .select()
      .from(guestbookEntries)
      .where(eq(guestbookEntries.id, id))
      .get();

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const entryPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.guestbookEntryId, id))
      .all();

    for (const photo of entryPhotos) {
      deletePhotoFile(photo.url);
    }

    await db.delete(guestbookEntries).where(eq(guestbookEntries.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin guestbook DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
