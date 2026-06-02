import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cameraSessions, cameraPhotos } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureUploadDirs } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    ensureUploadDirs();

    const formData = await request.formData();
    const token = formData.get('token') as string;
    const photoFile = formData.get('photo') as File | null;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    if (!photoFile || photoFile.size === 0) {
      return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 });
    }

    const session = await db
      .select()
      .from(cameraSessions)
      .where(eq(cameraSessions.token, token))
      .get();

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (session.photosTaken >= session.maxPhotos) {
      return NextResponse.json(
        { error: 'Film is full', photosTaken: session.photosTaken, maxPhotos: session.maxPhotos },
        { status: 403 },
      );
    }

    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(photoFile.name) || '.jpg';
    const filename = `cam-${session.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const filepath = path.join(process.cwd(), 'public/uploads/camera', filename);
    fs.writeFileSync(filepath, buffer);

    const photoUrl = `/uploads/camera/${filename}`;

    await db.insert(cameraPhotos).values({
      sessionId: session.id,
      url: photoUrl,
    });

    await db
      .update(cameraSessions)
      .set({ photosTaken: sql`${cameraSessions.photosTaken} + 1` })
      .where(eq(cameraSessions.id, session.id));

    const newCount = session.photosTaken + 1;

    return NextResponse.json({
      url: photoUrl,
      photosTaken: newCount,
      maxPhotos: session.maxPhotos,
      remaining: session.maxPhotos - newCount,
    });
  } catch (error) {
    console.error('Camera photo POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
