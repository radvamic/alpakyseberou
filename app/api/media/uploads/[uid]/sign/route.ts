import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deviceHash, forbidden, hasMediaAccess } from '@/lib/media/access';
import { presignPart } from '@/lib/media/r2';
import { findMedia } from '@/lib/media/server';
import { partCountFor } from '@/lib/media/shared';

const bodySchema = z.object({
  partNumbers: z.array(z.number().int().positive()).min(1).max(100),
});

/** Podepsané URL pro nahrání vybraných částí přímo do R2 (platí hodinu). */
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
    if (row.status !== 'uploading' || !row.uploadId) {
      return NextResponse.json({ error: 'Nahrávání už skončilo' }, { status: 409 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    const partCount = partCountFor(row.size, row.partSize);
    if (!parsed.success || parsed.data.partNumbers.some((n) => n > partCount)) {
      return NextResponse.json({ error: 'Neplatné části' }, { status: 400 });
    }

    const uploadId = row.uploadId;
    const entries = await Promise.all(
      parsed.data.partNumbers.map(
        async (n) => [n, await presignPart(row.originalKey, uploadId, n)] as const,
      ),
    );
    return NextResponse.json({ urls: Object.fromEntries(entries) });
  } catch (error) {
    console.error('Media sign error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
