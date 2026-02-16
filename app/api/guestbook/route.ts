import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { guestbookEntries, photos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message required' },
        { status: 400 },
      );
    }

    const photoUrls: string[] = [];
    const photoFiles = formData.getAll('photos');

    for (const file of photoFiles) {
      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filepath = path.join(
          process.cwd(),
          'public/uploads/guestbook',
          filename,
        );
        fs.writeFileSync(filepath, buffer);
        photoUrls.push(`/uploads/guestbook/${filename}`);
      }
    }

    const [entry] = await db
      .insert(guestbookEntries)
      .values({
        name,
        message,
        isPublic,
        createdAt: new Date().toISOString(),
      })
      .returning();

    if (photoUrls.length > 0) {
      await db.insert(photos).values(
        photoUrls.map((url) => ({
          type: 'guestbook' as const,
          guestbookEntryId: entry.id,
          name,
          url,
          createdAt: new Date().toISOString(),
        })),
      );
    }

    const entryPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.guestbookEntryId, entry.id))
      .all();

    return NextResponse.json({
      success: true,
      entry: {
        ...entry,
        photos: entryPhotos.map((p) => p.url),
      },
    });
  } catch (error) {
    console.error('Guestbook POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await db.select().from(guestbookEntries).all();
    const allPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.type, 'guestbook'))
      .all();

    const photoMap = new Map<number, string[]>();
    for (const p of allPhotos) {
      if (p.guestbookEntryId) {
        const existing = photoMap.get(p.guestbookEntryId) || [];
        existing.push(p.url);
        photoMap.set(p.guestbookEntryId, existing);
      }
    }

    const result = entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      message: entry.message,
      photos: photoMap.get(entry.id) || [],
      isPublic: entry.isPublic,
      createdAt: entry.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Guestbook GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
