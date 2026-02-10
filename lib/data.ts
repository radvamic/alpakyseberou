import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureFile(filePath: string) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
}

export function readData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  ensureFile(filePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

export function writeData<T>(filename: string, data: T[]) {
  const filePath = path.join(DATA_DIR, filename);
  ensureFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function ensureUploadDirs() {
  const dirs = [
    path.join(process.cwd(), 'public/uploads/guestbook'),
    path.join(process.cwd(), 'public/uploads/wedding-photos'),
  ];
  dirs.forEach(ensureDir);
}
