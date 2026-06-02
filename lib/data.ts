import fs from 'fs';
import path from 'path';

export function ensureUploadDirs() {
  const dirs = [
    path.join(process.cwd(), 'public/uploads/guestbook'),
    path.join(process.cwd(), 'public/uploads/wedding-photos'),
    path.join(process.cwd(), 'public/uploads/photobooth'),
    path.join(process.cwd(), 'public/uploads/camera'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
