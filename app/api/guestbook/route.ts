import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  photos: string[];
  isPublic: boolean;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message required' }, { status: 400 });
    }

    const photos: string[] = [];
    const photoFiles = formData.getAll('photos');

    for (const file of photoFiles) {
      if (file instanceof File && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const filepath = path.join(process.cwd(), 'public/uploads/guestbook', filename);
        fs.writeFileSync(filepath, buffer);
        photos.push(`/uploads/guestbook/${filename}`);
      }
    }

    const guestbook = readData<GuestbookEntry>('guestbook.json');
    const entry: GuestbookEntry = {
      id: Date.now(),
      name,
      message,
      photos,
      isPublic,
      createdAt: new Date().toISOString(),
    };

    guestbook.push(entry);
    writeData('guestbook.json', guestbook);

    return NextResponse.json({ success: true, entry });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const guestbook = readData<GuestbookEntry>('guestbook.json');
  return NextResponse.json(guestbook);
}
