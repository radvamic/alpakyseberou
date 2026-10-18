/**
 * Společné typy a pravidla pro fotky a videa od hostů — používá je server
 * (API, zpracování) i prohlížeč (nahrávání, galerie).
 */

export type MediaKind = 'photo' | 'video';
/** guests = nahrávají hosté; photographer / film = nahrává jen admin. */
export type MediaCollection = 'guests' | 'photographer' | 'film';
export const MEDIA_COLLECTIONS: readonly MediaCollection[] = ['guests', 'photographer', 'film'];

/** Jméno, pod kterým se v galerii a v ZIPu ukazují soubory od profesionálů. */
export const COLLECTION_AUTHOR: Record<Exclude<MediaCollection, 'guests'>, string> = {
  photographer: 'Svatební fotograf',
  film: 'Kameraman',
};
export type MediaVariant = 'thumb' | 'preview' | 'play' | 'download';

/** Položka galerie, jak ji vrací GET /api/media. */
export interface MediaItem {
  uid: string;
  guestName: string;
  guestKey: string;
  kind: MediaKind;
  collection: MediaCollection;
  status: 'processing' | 'ready';
  fileName: string;
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  takenAt: string | null;
  uploadedAt: string | null;
  hasThumb: boolean;
  mine: boolean;
}

export interface MediaListResponse {
  items: MediaItem[];
  isAdmin: boolean;
}

/** Odpověď POST /api/media/uploads — založení nebo navázání nahrávání. */
export type CreateUploadResponse =
  | { uid: string; state: 'done' }
  | {
      uid: string;
      state: 'uploading';
      partSize: number;
      partCount: number;
      uploadedParts: number[];
    };

export const MEDIA_DEVICE_HEADER = 'x-media-device';

/** 30 GB — delší 4K videa z telefonu se sem vejdou s rezervou. */
export const MAX_MEDIA_SIZE = 30 * 1024 ** 3;

const MIB = 1024 * 1024;
/** R2 vyžaduje stejně velké části (kromě poslední) a nejvýš 10 000 částí. */
const MIN_PART_SIZE = 8 * MIB;
const MAX_PARTS = 9_000;

export function partSizeFor(size: number): number {
  const needed = Math.ceil(size / MAX_PARTS);
  return Math.max(MIN_PART_SIZE, Math.ceil(needed / MIB) * MIB);
}

export function partCountFor(size: number, partSize: number): number {
  return Math.max(1, Math.ceil(size / partSize));
}

const VIDEO_EXT = ['mov', 'mp4', 'm4v', '3gp', '3g2', 'webm', 'mkv', 'avi', 'mts', 'm2ts'];
const PHOTO_EXT = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'gif', 'avif', 'dng', 'tif', 'tiff'];

export function fileExtension(name: string): string {
  const match = /\.([a-z0-9]{1,5})$/i.exec(name);
  return match ? match[1].toLowerCase() : '';
}

/** Typ podle MIME, a když ho prohlížeč nepošle (Android u .mov), podle přípony. */
export function detectKind(type: string, name: string): MediaKind | null {
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('image/')) return 'photo';
  const ext = fileExtension(name);
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (PHOTO_EXT.includes(ext)) return 'photo';
  return null;
}

export function fileFingerprint(file: { name: string; size: number; lastModified: number }): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function mediaUrl(uid: string, variant: MediaVariant): string {
  return `/api/media/${uid}/${variant}`;
}

export function formatBytes(bytes: number, locale: 'cs' | 'en' = 'cs'): string {
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const digits = unit >= 3 ? 1 : 0;
  return `${value.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })} ${units[unit]}`;
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${h > 0 ? String(m).padStart(2, '0') : m}:${String(s).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}
