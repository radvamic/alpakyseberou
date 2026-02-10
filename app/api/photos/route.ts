import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

interface PhotoEntry {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const name = (formData.get('name') as string) || 'Anonym';
    const photoFiles = formData.getAll('photos');

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json({ error: 'No photos uploaded' }, { status: 400 });
    }

    const photos = readData<PhotoEntry>('photos.json');
    const entries: PhotoEntry[] = [];

    for (const file of photoFiles) {
      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filepath = path.join(process.cwd(), 'public/uploads/wedding-photos', filename);
        fs.writeFileSync(filepath, buffer);

        entries.push({
          id: Date.now() + Math.random(),
          name,
          url: `/uploads/wedding-photos/${filename}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    photos.push(...entries);
    writeData('photos.json', photos);

    return NextResponse.json({ success: true, count: entries.length });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const photos = readData<PhotoEntry>('photos.json');
  return NextResponse.json(photos);
}
