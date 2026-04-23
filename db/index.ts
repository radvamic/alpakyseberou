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

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
