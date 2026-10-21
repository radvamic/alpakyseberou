import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { storedPhotoPath } from '@/lib/delete-stored-photo';
import { cameraFileName, findCameraPhoto } from '@/lib/media/camera';
import { presignGet } from '@/lib/media/r2';
import { findMedia } from '@/lib/media/server';
import { cameraPhotoId } from '@/lib/media/shared';

/** Formáty, které umí zobrazit každý prohlížeč i bez převodu. */
const BROWSER_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Stálé adresy souborů v galerii. Přesměrují na krátkodobě podepsanou URL
 * v R2 — samotné bajty přes tenhle server nejdou.
 *   thumb    — náhled do mřížky
 *   preview  — velká fotka / úvodní snímek videa
 *   play     — video pro přehrávač (převedené, jinak originál)
 *   download — originál ke stažení
 * Snímky z jednorázového fotoaparátu jsou na disku serveru a jdou přímo odsud.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string; variant: string }> },
) {
  try {
    const { uid, variant } = await params;
    const cameraId = cameraPhotoId(uid);
    if (cameraId !== null) return await cameraVariant(cameraId, variant);

    const row = await findMedia(uid);
    if (!row || row.status === 'uploading') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let url: string | null = null;
    switch (variant) {
      case 'thumb':
        url = row.thumbKey ? await presignGet(row.thumbKey) : null;
        break;
      case 'preview':
        if (row.previewKey) url = await presignGet(row.previewKey);
        else if (row.kind === 'photo' && BROWSER_IMAGE.includes(row.contentType)) {
          url = await presignGet(row.originalKey, { contentType: row.contentType });
        }
        break;
      case 'play':
        if (row.kind === 'video') {
          url = await presignGet(row.playbackKey ?? row.originalKey, {
            contentType: row.playbackKey ? 'video/mp4' : row.contentType,
          });
        }
        break;
      case 'download':
        url = await presignGet(row.originalKey, { downloadName: row.fileName });
        break;
    }

    if (!url) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.redirect(url, {
      status: 302,
      headers: { 'Cache-Control': 'private, max-age=3600' },
    });
  } catch (error) {
    console.error('Media variant error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function cameraVariant(id: number, variant: string) {
  const found = await findCameraPhoto(id);
  const publicUrl =
    variant === 'thumb'
      ? found?.photo.thumbnailUrl || found?.photo.url
      : variant === 'preview' || variant === 'download'
        ? found?.photo.url
        : null;
  const file = publicUrl ? storedPhotoPath(publicUrl) : null;
  if (!found || !file || !fs.existsSync(file)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'private, max-age=3600',
  };
  if (variant === 'download') {
    headers['Content-Disposition'] = `attachment; filename="${cameraFileName(found.photo)}"`;
  }
  return new NextResponse(await fs.promises.readFile(file), { headers });
}
