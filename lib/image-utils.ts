import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

/**
 * Process an uploaded image:
 * - Resize original to max 1920px (display version, replaces the raw file)
 * - Create a thumbnail at max 600px
 * Returns public URL paths for both.
 */
export async function processUploadedImage(
  buffer: Buffer,
  folder: string,
  basename: string,
): Promise<{ displayUrl: string; thumbnailUrl: string }> {
  const folderPath = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(folderPath, { recursive: true });

  const displayFilename = `${basename}.jpg`;
  const thumbFilename = `${basename}_thumb.jpg`;

  await sharp(buffer)
    .rotate()
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(path.join(folderPath, displayFilename));

  await sharp(buffer)
    .rotate()
    .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true })
    .toFile(path.join(folderPath, thumbFilename));

  return {
    displayUrl: `/uploads/${folder}/${displayFilename}`,
    thumbnailUrl: `/uploads/${folder}/${thumbFilename}`,
  };
}
