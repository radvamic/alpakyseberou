import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const name = (formData.get('name') as string) || 'Anonym';
    const photoFiles = formData.getAll('photos');

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json(
        { error: 'No photos uploaded' },
        { status: 400 },
      );
    }

    const entries: { name: string; url: string; type: 'wedding'; createdAt: string }[] = [];

    for (const file of photoFiles) {
      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filepath = path.join(
          process.cwd(),
          'public/uploads/wedding-photos',
          filename,
        );
        fs.writeFileSync(filepath, buffer);

        entries.push({
          type: 'wedding',
          name,
          url: `/uploads/wedding-photos/${filename}`,
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

export async function GET() {
  try {
    const weddingPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.type, 'wedding'))
      .all();

    return NextResponse.json(weddingPhotos);
  } catch (error) {
    console.error('Photos GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
