import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';
import { baselineMigrations } from './baseline';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'wedding.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('Running migrations...');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Musí předcházet migracím — viz komentář v db/baseline.ts.
const baseline = baselineMigrations(sqlite, MIGRATIONS_DIR);
if (baseline.inserted.length > 0) {
  console.log('Doplněny záznamy migrací:', baseline.inserted.join(', '));
}

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: MIGRATIONS_DIR });
console.log('Migrations complete.');

// ---------------------------------------------------------------------------
// Migrate existing JSON data
// ---------------------------------------------------------------------------

function readJson<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

interface OldRsvp {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  children: boolean;
  childrenCount: number;
  menuPreference: string;
  allergies: string;
  songRequest: string;
  songNever: string;
  createdAt: string;
}

interface OldGuestbook {
  id: number;
  name: string;
  message: string;
  photos: string[];
  isPublic: boolean;
  createdAt: string;
}

interface OldPhoto {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

const oldRsvps = readJson<OldRsvp>('rsvp.json');
const oldGuestbook = readJson<OldGuestbook>('guestbook.json');
const oldPhotos = readJson<OldPhoto>('photos.json');

const hasData =
  oldRsvps.length > 0 || oldGuestbook.length > 0 || oldPhotos.length > 0;

if (hasData) {
  console.log(
    `Found existing data: ${oldRsvps.length} RSVPs, ${oldGuestbook.length} guestbook entries, ${oldPhotos.length} photos`,
  );

  const existingRsvps = sqlite
    .prepare('SELECT COUNT(*) as count FROM rsvps')
    .get() as { count: number };

  if (existingRsvps.count > 0) {
    console.log('Database already has data — skipping JSON migration.');
  } else {
    const insertRsvp = sqlite.prepare(`
      INSERT INTO rsvps (name, email, attending, guests, children, children_count, menu_preference, allergies, song_request, song_never, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertGuestbook = sqlite.prepare(`
      INSERT INTO guestbook_entries (name, message, is_public, created_at)
      VALUES (?, ?, ?, ?)
    `);

    const insertPhoto = sqlite.prepare(`
      INSERT INTO photos (type, guestbook_entry_id, name, url, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const migrateAll = sqlite.transaction(() => {
      for (const r of oldRsvps) {
        insertRsvp.run(
          r.name,
          r.email || '',
          r.attending ? 1 : 0,
          r.guests || 1,
          r.children ? 1 : 0,
          r.childrenCount || 0,
          r.menuPreference || '',
          r.allergies || '',
          r.songRequest || '',
          r.songNever || '',
          r.createdAt,
        );
      }
      console.log(`  Migrated ${oldRsvps.length} RSVPs`);

      for (const g of oldGuestbook) {
        const result = insertGuestbook.run(
          g.name,
          g.message,
          g.isPublic ? 1 : 0,
          g.createdAt,
        );
        const guestbookId = result.lastInsertRowid;

        for (const photoUrl of g.photos) {
          insertPhoto.run('guestbook', guestbookId, g.name, photoUrl, g.createdAt);
        }
      }
      console.log(`  Migrated ${oldGuestbook.length} guestbook entries`);

      for (const p of oldPhotos) {
        insertPhoto.run('wedding', null, p.name, p.url, p.createdAt);
      }
      console.log(`  Migrated ${oldPhotos.length} wedding photos`);
    });

    migrateAll();
    console.log('JSON data migration complete!');
  }
} else {
  console.log('No existing JSON data to migrate.');
}

sqlite.close();
console.log('Done.');
