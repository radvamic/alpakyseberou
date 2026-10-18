import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { media } from '@/db/schema';
import { deviceHash, forbidden, hasMediaAccess } from '@/lib/media/access';
import { createMultipart, listUploadedParts, originalKeyFor } from '@/lib/media/r2';
import {
  MAX_MEDIA_SIZE,
  detectKind,
  fileExtension,
  fileFingerprint,
  partCountFor,
  partSizeFor,
  type CreateUploadResponse,
} from '@/lib/media/shared';
import { formatGuestName, guestIdentitySchema, identityKey } from '@/lib/guest-identity';

const bodySchema = guestIdentitySchema.extend({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_MEDIA_SIZE),
  type: z.string().max(100),
  lastModified: z.number().int().nonnegative(),
});

/**
 * Založí nahrávání jednoho souboru, nebo naváže na přerušené.
 *
 * Stejný soubor ze stejného telefonu (název + velikost + čas změny) se
 * nezakládá znovu: hotový se přeskočí, rozpracovaný pokračuje od chybějících
 * částí. Díky tomu může host po výpadku prostě vybrat fotky znovu.
 */
export async function POST(request: NextRequest) {
  if (!hasMediaAccess(request)) return forbidden();
  const device = deviceHash(request);
  if (!device) return NextResponse.json({ error: 'Chybí token zařízení' }, { status: 400 });

  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data' }, { status: 400 });
    }
    const body = parsed.data;
    const kind = detectKind(body.type, body.name);
    if (!kind) {
      return NextResponse.json({ error: 'Nepodporovaný typ souboru' }, { status: 415 });
    }

    const fingerprint = fileFingerprint(body);
    const existing = await db
      .select()
      .from(media)
      .where(and(eq(media.deviceHash, device), eq(media.fingerprint, fingerprint)))
      .get();

    if (existing && existing.status !== 'uploading') {
      return NextResponse.json<CreateUploadResponse>({ uid: existing.uid, state: 'done' });
    }

    const partSize = partSizeFor(body.size);
    const partCount = partCountFor(body.size, partSize);

    if (existing) {
      const parts = existing.uploadId
        ? await listUploadedParts(existing.originalKey, existing.uploadId)
        : null;
      if (parts) {
        return NextResponse.json<CreateUploadResponse>({
          uid: existing.uid,
          state: 'uploading',
          partSize: existing.partSize,
          partCount: partCountFor(existing.size, existing.partSize),
          uploadedParts: parts.map((p) => p.PartNumber ?? 0).filter((n) => n > 0),
        });
      }
      // R2 nedokončená nahrávání po 7 dnech maže — začne se znovu
      const uploadId = await createMultipart(existing.originalKey, existing.contentType);
      await db
        .update(media)
        .set({ uploadId, partSize })
        .where(eq(media.id, existing.id));
      return NextResponse.json<CreateUploadResponse>({
        uid: existing.uid,
        state: 'uploading',
        partSize,
        partCount,
        uploadedParts: [],
      });
    }

    const uid = crypto.randomUUID();
    const ext = fileExtension(body.name);
    const originalKey = originalKeyFor(uid, ext);
    const contentType = body.type || (kind === 'video' ? 'video/mp4' : 'application/octet-stream');
    const uploadId = await createMultipart(originalKey, contentType);

    await db.insert(media).values({
      uid,
      guestName: formatGuestName(body.firstName, body.lastName),
      guestKey: identityKey(body.firstName, body.lastName),
      deviceHash: device,
      fingerprint,
      kind,
      fileName: body.name,
      contentType,
      size: body.size,
      partSize,
      originalKey,
      uploadId,
    });

    return NextResponse.json<CreateUploadResponse>({
      uid,
      state: 'uploading',
      partSize,
      partCount,
      uploadedParts: [],
    });
  } catch (error) {
    console.error('Media upload create error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
