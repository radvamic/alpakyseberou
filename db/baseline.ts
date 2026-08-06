import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Database as SqliteDatabase } from 'better-sqlite3';

/**
 * Doplní chybějící záznamy do __drizzle_migrations u databází, jejichž schéma
 * už dané změny obsahuje.
 *
 * Kontext: migrace 0002–0004 se na existující databáze nikdy neaplikovaly
 * (0002 a 0003 měly v journalu špatný rok, 0004 vznikla až zpětně). Schéma se
 * do nich přesto dostalo — dotvářejí ho safety nety v db/index.ts. Bez záznamu
 * v __drizzle_migrations by je ale migrátor chtěl spustit znovu a padal by na
 * "duplicate column name". A protože Drizzle pouští všechny migrace v jedné
 * transakci, tenhle pád zablokuje i všechny budoucí migrace.
 *
 * Funkce nikdy nemění schéma ani data — jen dopisuje záznam o tom, co v
 * databázi prokazatelně už je. Je idempotentní a na čerstvé databázi neudělá nic.
 */

type ColumnInfo = { name: string };
type JournalEntry = { idx: number; when: number; tag: string };

const hasColumn = (sqlite: SqliteDatabase, table: string, column: string): boolean =>
  (sqlite.prepare(`PRAGMA table_info(${table})`).all() as ColumnInfo[]).some(
    (info) => info.name === column,
  );

const tableNames = (sqlite: SqliteDatabase): string[] =>
  (
    sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as {
      name: string;
    }[]
  ).map((row) => row.name);

/**
 * Detektory "je tahle migrace v databázi už promítnutá?".
 * Migrace, která tu nemá záznam, se záměrně nechává migrátoru.
 */
const ALREADY_APPLIED_PROBES: Record<string, (sqlite: SqliteDatabase) => boolean> = {
  '0002_add_stay_duration': (sqlite) => hasColumn(sqlite, 'rsvps', 'stay_duration'),

  '0003_camera': (sqlite) => {
    const tables = tableNames(sqlite);
    return tables.includes('camera_sessions') && tables.includes('camera_photos');
  },

  '0004_add_thumbnail_columns': (sqlite) =>
    hasColumn(sqlite, 'photos', 'thumbnail_url') &&
    hasColumn(sqlite, 'photos', 'challenge_text') &&
    hasColumn(sqlite, 'camera_photos', 'thumbnail_url'),
};

export interface BaselineResult {
  inserted: string[];
  skipped: boolean;
}

export function baselineMigrations(
  sqlite: SqliteDatabase,
  migrationsDir: string = path.join(process.cwd(), 'db', 'migrations'),
): BaselineResult {
  // Na čerstvé databázi tabulka ještě není — migrace proběhnou normálně.
  if (!tableNames(sqlite).includes('__drizzle_migrations')) {
    return { inserted: [], skipped: true };
  }

  const journalPath = path.join(migrationsDir, 'meta', '_journal.json');
  if (!fs.existsSync(journalPath)) {
    return { inserted: [], skipped: true };
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as {
    entries: JournalEntry[];
  };

  const recordedHashes = new Set(
    (sqlite.prepare('SELECT hash FROM __drizzle_migrations').all() as { hash: string }[]).map(
      (row) => row.hash,
    ),
  );

  const insertRecord = sqlite.prepare(
    'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
  );

  const inserted: string[] = [];

  for (const entry of journal.entries) {
    const sqlPath = path.join(migrationsDir, `${entry.tag}.sql`);
    if (!fs.existsSync(sqlPath)) continue;

    // Drizzle počítá hash jako sha256 z celého obsahu .sql souboru.
    const hash = crypto.createHash('sha256').update(fs.readFileSync(sqlPath, 'utf8')).digest('hex');
    if (recordedHashes.has(hash)) continue;

    const probe = ALREADY_APPLIED_PROBES[entry.tag];
    if (!probe || !probe(sqlite)) continue;

    insertRecord.run(hash, entry.when);
    inserted.push(entry.tag);
  }

  return { inserted, skipped: false };
}
