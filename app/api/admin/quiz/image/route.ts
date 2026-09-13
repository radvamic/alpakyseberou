import { NextRequest, NextResponse } from 'next/server';
import { canManageQuiz } from '@/lib/quiz-organizer';
import { processUploadedImage } from '@/lib/image-utils';

const MAX_BYTES = 25 * 1024 * 1024;

/** Nahraje obrázek k otázce. Uloží se až spolu s otázkou (PUT/POST). */
export async function POST(request: NextRequest) {
  if (!canManageQuiz(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('image');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Chybí soubor s obrázkem.' }, { status: 400 });
    }
    if (file.type && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Soubor není obrázek.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Obrázek je větší než 25 MB.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { displayUrl } = await processUploadedImage(buffer, 'quiz', `q-${Date.now()}`);

    return NextResponse.json({ url: displayUrl });
  } catch (error) {
    console.error('Admin quiz image POST error:', error);
    return NextResponse.json({ error: 'Obrázek se nepodařilo zpracovat.' }, { status: 500 });
  }
}
