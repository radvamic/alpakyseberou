import fs from 'fs';
import path from 'path';

/** Path on disk of a file under public/uploads/ from its public URL path. */
export function storedPhotoPath(publicUrl: string): string | null {
  if (!publicUrl.startsWith('/uploads/')) return null;

  const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
  const relative = publicUrl.replace(/^\/uploads\//, '');
  const filePath = path.join(uploadsRoot, ...relative.split('/'));

  return filePath.startsWith(uploadsRoot + path.sep) ? filePath : null;
}

/** Remove a file under public/uploads/ from its public URL path. */
export function deletePhotoFile(publicUrl: string): void {
  const filePath = storedPhotoPath(publicUrl);
  if (!filePath) return;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return;

  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore missing file
  }
}
