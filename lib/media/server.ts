import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';

export type MediaRow = typeof media.$inferSelect;

export async function findMedia(uid: string): Promise<MediaRow | undefined> {
  if (!/^[0-9a-f-]{36}$/.test(uid)) return undefined;
  return db.select().from(media).where(eq(media.uid, uid)).get();
}

/** Všechny klíče v R2, které k položce patří. */
export function storedKeys(row: MediaRow): string[] {
  return [row.originalKey, row.thumbKey, row.previewKey, row.playbackKey, row.mobileKey].filter(
    (key): key is string => !!key,
  );
}
