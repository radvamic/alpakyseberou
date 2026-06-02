import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';
import { deletePhotoFile } from '@/lib/delete-stored-photo';

const ALLOWED_TYPES = ['wedding', 'table-challenge'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

function parseType(raw: string | null): AllowedType {
  return raw === 'table-challenge' ? 'table-challenge' : 'wedding';
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const type = parseType(request.nextUrl.searchParams.get('type'));

    const rows = await db
      .select()
      .from(photos)
      .where(eq(photos.type, type))
      .orderBy(desc(photos.createdAt))
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Admin photos GET error:', error);
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

    const row = await db.select().from(photos).where(eq(photos.id, id)).get();

    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (!ALLOWED_TYPES.includes(row.type as AllowedType)) {
      return NextResponse.json({ error: 'Cannot delete this photo type' }, { status: 403 });
    }

    deletePhotoFile(row.url);
    if (row.thumbnailUrl) deletePhotoFile(row.thumbnailUrl);
    await db.delete(photos).where(and(eq(photos.id, id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin photos DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
