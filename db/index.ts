import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import * as schema from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'wedding.db');

const sqlite = new Database(DB_PATH);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Safety net: ensure stay_duration column exists in case migration didn't run
const rsvpCols = sqlite.pragma('table_info(rsvps)') as { name: string }[];
if (rsvpCols.length > 0 && !rsvpCols.some((c) => c.name === 'stay_duration')) {
  sqlite.exec("ALTER TABLE rsvps ADD COLUMN stay_duration TEXT DEFAULT ''");
  console.log('[db] Added missing stay_duration column.');
}

// Safety net: ensure camera tables exist
const existingTables = (
  sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
).map((t) => t.name);

if (!existingTables.includes('camera_sessions')) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS camera_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      guest_name TEXT NOT NULL,
      photos_taken INTEGER NOT NULL DEFAULT 0,
      max_photos INTEGER NOT NULL DEFAULT 25,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log('[db] Created missing camera_sessions table.');
}

if (!existingTables.includes('camera_photos')) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS camera_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      session_id INTEGER NOT NULL REFERENCES camera_sessions(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log('[db] Created missing camera_photos table.');
}

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
