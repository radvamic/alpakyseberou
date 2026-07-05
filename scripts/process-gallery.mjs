/**
 * Zpracování fotek galerie:
 * - Originály: zmenší na max 1600px (zachová poměr), quality 85 JPEG (přepíše in-place)
 * - Miniatury: max 600px, quality 80 JPEG → gallery/thumbs/
 *
 * Spuštění: node scripts/process-gallery.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GALLERY_DIR = path.join(__dirname, '../public/assets/images/gallery');
const THUMBS_DIR = path.join(GALLERY_DIR, 'thumbs');

const FULL_MAX = 1600;
const FULL_QUALITY = 85;
const THUMB_MAX = 600;
const THUMB_QUALITY = 80;

if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  console.log('Vytvořena složka thumbs/');
}

const files = fs
  .readdirSync(GALLERY_DIR)
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`Zpracovávám ${files.length} fotek...\n`);

let totalSavedKB = 0;

for (const file of files) {
  const src = path.join(GALLERY_DIR, file);
  const thumbDest = path.join(THUMBS_DIR, file.replace(/\.[^.]+$/, '.jpg'));

  const originalSize = fs.statSync(src).size;
  const meta = await sharp(src).metadata();

  // — Fullsize (přepsat in-place) —
  const tmpFull = src + '.tmp';
  await sharp(src)
    .rotate() // opraví EXIF orientaci
    .resize(FULL_MAX, FULL_MAX, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: FULL_QUALITY, mozjpeg: true })
    .toFile(tmpFull);

  const newFullSize = fs.statSync(tmpFull).size;
  fs.renameSync(tmpFull, src);

  // — Thumbnail —
  await sharp(src)
    .resize(THUMB_MAX, THUMB_MAX, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
    .toFile(thumbDest);

  const thumbSize = fs.statSync(thumbDest).size;
  const savedKB = Math.round((originalSize - newFullSize) / 1024);
  totalSavedKB += savedKB;

  console.log(
    `${file.padEnd(50)} ${Math.round(originalSize / 1024)}KB → full: ${Math.round(newFullSize / 1024)}KB  thumb: ${Math.round(thumbSize / 1024)}KB  (ušetřeno ${savedKB}KB)`
  );
}

console.log(`\nHotovo. Celkem ušetřeno: ${Math.round(totalSavedKB / 1024 * 10) / 10} MB`);
