import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ensureUploadDirs } from '@/lib/data';
import { PHOTO_SOURCES, resolvePhotoSource } from '@/lib/upload-sources';
import { processUploadedImage } from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const name = (formData.get('name') as string) || 'Anonym';
    const challengeText = (formData.get('challenge_text') as string) || '';
    const photoFiles = formData.getAll('photos');
    const source = resolvePhotoSource(formData.get('source') as string | null);
    const config = PHOTO_SOURCES[source];

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json(
        { error: 'No photos uploaded' },
        { status: 400 },
      );
    }

    const entries: {
      name: string;
      url: string;
      thumbnailUrl: string;
      challengeText: string;
      type: typeof config.type;
      createdAt: string;
    }[] = [];

    for (const file of photoFiles) {
      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const basename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        const { displayUrl, thumbnailUrl } = await processUploadedImage(
          buffer,
          config.folder,
          basename,
        );

        entries.push({
          type: config.type,
          name,
          url: displayUrl,
          thumbnailUrl,
          challengeText,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (entries.length > 0) {
      await db.insert(photos).values(entries);
    }

    return NextResponse.json({ success: true, count: entries.length });
  } catch (error) {
    console.error('Photos POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const typeParam = request.nextUrl.searchParams.get('type');
    const type =
      typeParam === 'table-challenge' ? 'table-challenge' : 'wedding';

    const rows = await db
      .select()
      .from(photos)
      .where(eq(photos.type, type))
      .orderBy(desc(photos.createdAt))
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Photos GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
