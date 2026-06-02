export type PhotoSource = 'guest' | 'table-challenge';

export const PHOTO_SOURCES: Record<
  PhotoSource,
  { folder: string; type: 'wedding' | 'table-challenge'; urlPrefix: string }
> = {
  guest: {
    folder: 'wedding-photos',
    type: 'wedding',
    urlPrefix: '/uploads/wedding-photos',
  },
  'table-challenge': {
    folder: 'table-challenge',
    type: 'table-challenge',
    urlPrefix: '/uploads/table-challenge',
  },
};

export function resolvePhotoSource(raw: string | null): PhotoSource {
  return raw === 'table-challenge' ? 'table-challenge' : 'guest';
}
