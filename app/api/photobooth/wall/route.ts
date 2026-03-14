import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { photoboothPhotos } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(photoboothPhotos)
      .where(eq(photoboothPhotos.isPublic, true))
      .orderBy(desc(photoboothPhotos.createdAt))
      .all();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Photobooth wall GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, originalPhotoUrl, generatedPhotoUrl, category, motifId, isPublic } = body;

    if (!userName || !generatedPhotoUrl || !category || !motifId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const [entry] = await db
      .insert(photoboothPhotos)
      .values({
        userName,
        originalPhotoUrl: originalPhotoUrl || '',
        generatedPhotoUrl,
        category,
        motifId,
        isPublic: isPublic ?? false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Photobooth wall POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
