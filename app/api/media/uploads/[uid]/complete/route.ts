import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { deviceHash, forbidden, hasMediaAccess } from '@/lib/media/access';
import { completeMultipart, listUploadedParts, objectSize } from '@/lib/media/r2';
import { findMedia } from '@/lib/media/server';
import { partCountFor } from '@/lib/media/shared';
import { notifyMediaWorker } from '@/lib/media/worker';

/**
 * Složí nahrané části do jednoho souboru. Seznam částí si server bere přímo
 * z R2, takže prohlížeč nemusí číst ETagy. Když nějaká část chybí nebo má
 * špatnou velikost, vrátí 409 se seznamem, co nahrát znovu.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  if (!hasMediaAccess(request)) return forbidden();
  const device = deviceHash(request);

  try {
    const { uid } = await params;
    const row = await findMedia(uid);
    if (!row || row.deviceHash !== device) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (row.status !== 'uploading') {
      return NextResponse.json({ ok: true });
    }

    const markUploaded = async () => {
      await db
        .update(media)
        .set({ status: 'processing', uploadId: null, uploadedAt: new Date().toISOString() })
        .where(eq(media.id, row.id));
      notifyMediaWorker();
    };

    const parts = row.uploadId ? await listUploadedParts(row.originalKey, row.uploadId) : null;
    if (!parts) {
      // Předchozí pokus mohl soubor složit, ale odpověď se ztratila
      if ((await objectSize(row.originalKey)) === row.size) {
        await markUploaded();
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: 'Nahrávání vypršelo', restart: true }, { status: 410 });
    }

    const partCount = partCountFor(row.size, row.partSize);
    const bySize = new Map(parts.map((p) => [p.PartNumber ?? 0, p.Size ?? 0]));
    const missing: number[] = [];
    for (let n = 1; n <= partCount; n++) {
      const expected = n < partCount ? row.partSize : row.size - row.partSize * (partCount - 1);
      if (bySize.get(n) !== expected) missing.push(n);
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Chybí části', missing }, { status: 409 });
    }

    await completeMultipart(
      row.originalKey,
      row.uploadId!,
      parts.filter((p) => (p.PartNumber ?? 0) <= partCount),
    );
    await markUploaded();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Media complete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
