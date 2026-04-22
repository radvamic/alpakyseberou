import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photoboothPhotos } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const entries = await db
      .select()
      .from(photoboothPhotos)
      .orderBy(desc(photoboothPhotos.createdAt))
      .all();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Admin photobooth GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
