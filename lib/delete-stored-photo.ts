import fs from 'fs';
import path from 'path';

/** Remove a file under public/uploads/ from its public URL path. */
export function deletePhotoFile(publicUrl: string): void {
  if (!publicUrl.startsWith('/uploads/')) return;

  const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');
  const relative = publicUrl.replace(/^\/uploads\//, '');
  const filePath = path.join(uploadsRoot, ...relative.split('/'));

  if (!filePath.startsWith(uploadsRoot)) return;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return;

  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore missing file
  }
}
