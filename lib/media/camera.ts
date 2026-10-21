import fs from 'fs';
import { eq, sql } from 'drizzle-orm';
import sharp from 'sharp';
import { db } from '@/db';
import { cameraPhotos, cameraSessions } from '@/db/schema';
import { storedPhotoPath, deletePhotoFile } from '@/lib/delete-stored-photo';
import { formatGuestName } from '@/lib/guest-identity';
import type { MediaItem } from '@/lib/media/shared';

/**
 * Snímky z jednorázového fotoaparátu (/kamera) v galerii /fotky. Na rozdíl
 * od ostatních položek neleží v R2, ale na disku serveru (public/uploads/camera,
 * verze do 1920 px a náhled) — galerie je jen čte a vydává za své položky.
 */

export type CameraPhotoRow = typeof cameraPhotos.$inferSelect;

/** Rozměry náhledů se čtou z hlavičky souboru jen jednou. */
const dimensions = new Map<number, { width: number; height: number } | null>();

async function photoDimensions(row: CameraPhotoRow) {
  if (!dimensions.has(row.id)) {
    const file = storedPhotoPath(row.thumbnailUrl || row.url);
    let dims: { width: number; height: number } | null = null;
    try {
      const meta = file ? await sharp(file).metadata() : null;
      if (meta?.width && meta.height) dims = { width: meta.width, height: meta.height };
    } catch {
      // chybějící nebo poškozený soubor — v mřížce bude čtverec
    }
    dimensions.set(row.id, dims);
  }
  return dimensions.get(row.id) ?? null;
}

function fileSize(publicUrl: string): number {
  const file = storedPhotoPath(publicUrl);
  try {
    return file ? fs.statSync(file).size : 0;
  } catch {
    return 0;
  }
}

/** SQLite datetime('now') je UTC bez zóny: „2026-09-26 12:06:42“. */
export function sqliteUtcToIso(value: string): string {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(' ', 'T')}Z` : value;
}

export function cameraFileName(row: CameraPhotoRow): string {
  return `jednorazovka-${row.id}.jpg`;
}

export async function listCameraItems(): Promise<MediaItem[]> {
  const rows = await db
    .select({ photo: cameraPhotos, session: cameraSessions })
    .from(cameraPhotos)
    .innerJoin(cameraSessions, eq(cameraPhotos.sessionId, cameraSessions.id))
    .orderBy(cameraPhotos.id)
    .all();

  return Promise.all(
    rows.map(async ({ photo, session }) => {
      const dims = await photoDimensions(photo);
      const takenAt = sqliteUtcToIso(photo.createdAt);
      return {
        uid: `cam-${photo.id}`,
        guestName: formatGuestName(session.guestName, session.guestSurname),
        guestKey: session.identityKey || `camera-session:${session.id}`,
        kind: 'photo',
        collection: 'camera',
        status: 'ready',
        fileName: cameraFileName(photo),
        size: fileSize(photo.url),
        width: dims?.width ?? null,
        height: dims?.height ?? null,
        durationMs: null,
        takenAt,
        uploadedAt: takenAt,
        hasThumb: true,
        mine: false,
      } satisfies MediaItem;
    }),
  );
}

export async function findCameraPhoto(id: number) {
  return db
    .select({ photo: cameraPhotos, session: cameraSessions })
    .from(cameraPhotos)
    .innerJoin(cameraSessions, eq(cameraPhotos.sessionId, cameraSessions.id))
    .where(eq(cameraPhotos.id, id))
    .get();
}

/** Smaže soubory i záznam a vrátí hostovi políčko na filmu. */
export async function deleteCameraPhoto(photo: CameraPhotoRow): Promise<void> {
  deletePhotoFile(photo.url);
  if (photo.thumbnailUrl) deletePhotoFile(photo.thumbnailUrl);
  dimensions.delete(photo.id);

  await db.delete(cameraPhotos).where(eq(cameraPhotos.id, photo.id));
  await db
    .update(cameraSessions)
    .set({ photosTaken: sql`MAX(0, ${cameraSessions.photosTaken} - 1)` })
    .where(eq(cameraSessions.id, photo.sessionId));
}
