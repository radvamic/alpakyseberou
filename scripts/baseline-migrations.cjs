#!/usr/bin/env node
/**
 * Jednorázová oprava pro databáze vzniklé PŘED opravou db/migrations/meta/_journal.json.
 *
 * Kontext: migrace 0002 a 0003 měly v journalu časové razítko s rokem 2025 místo 2026,
 * takže byly starší než 0001. Drizzle pouští jen migrace novější než poslední zapsaná,
 * a proto je na existujících databázích tiše přeskakoval. Schéma se do nich přesto
 * dostalo jinou cestou (drizzle-kit push), takže sedí — chybí jen záznam o aplikaci.
 *
 * Po opravě journalu by je migrátor chtěl spustit znovu a spadl by na
 * "duplicate column name: stay_duration". Tenhle skript proto u každé nezapsané
 * migrace ověří, jestli její změny v databázi UŽ JSOU, a pokud ano, doplní jen
 * chybějící záznam. Nic v datech ani ve schématu nemění.
 *
 * Skript je idempotentní — opakované spuštění nic dalšího neudělá.
 * Na čerstvé databázi neudělá nic a migrace proběhnou normálně.
 *
 * Použití:  node scripts/baseline-migrations.cjs [cesta/k/db]
 *           (bez argumentu použije data/wedding.db)
 */
const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.argv[2] || path.join(process.cwd(), 'data', 'wedding.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

/**
 * Detektory "už je to v databázi?" pro konkrétní migrace.
 * Migrace, která tu nemá záznam, se záměrně nechává migrátoru.
 */
const ALREADY_APPLIED_PROBES = {
  '0002_add_stay_duration': (sqlite) =>
    sqlite
      .prepare('PRAGMA table_info(rsvps)')
      .all()
      .some((column) => column.name === 'stay_duration'),

  '0003_camera': (sqlite) => {
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name);
    return tables.includes('camera_sessions') && tables.includes('camera_photos');
  },
};

if (!fs.existsSync(DB_PATH)) {
  console.log(`Databáze ${DB_PATH} neexistuje — není co opravovat.`);
  process.exit(0);
}

const sqlite = new Database(DB_PATH);

// Na čerstvé databázi tabulka ještě není; pak není co baseline-ovat.
const hasMigrationsTable = sqlite
  .prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'")
  .get().count > 0;

if (!hasMigrationsTable) {
  console.log('Tabulka __drizzle_migrations neexistuje — databáze je čerstvá, migrace proběhnou normálně.');
  sqlite.close();
  process.exit(0);
}

const journal = JSON.parse(fs.readFileSync(path.join(MIGRATIONS_DIR, 'meta', '_journal.json'), 'utf8'));

const recordedHashes = new Set(
  sqlite.prepare('SELECT hash FROM __drizzle_migrations').all().map((row) => row.hash),
);

const insertRecord = sqlite.prepare('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)');

let inserted = 0;

for (const entry of journal.entries) {
  const sqlPath = path.join(MIGRATIONS_DIR, `${entry.tag}.sql`);
  if (!fs.existsSync(sqlPath)) {
    console.warn(`  ! ${entry.tag}: chybí SQL soubor, přeskakuji`);
    continue;
  }

  // Drizzle počítá hash jako sha256 z celého obsahu .sql souboru.
  const hash = crypto.createHash('sha256').update(fs.readFileSync(sqlPath, 'utf8')).digest('hex');

  if (recordedHashes.has(hash)) {
    console.log(`  = ${entry.tag}: už zapsaná`);
    continue;
  }

  const probe = ALREADY_APPLIED_PROBES[entry.tag];
  if (!probe) {
    console.log(`  → ${entry.tag}: nezapsaná, nechávám migrátoru`);
    continue;
  }

  if (!probe(sqlite)) {
    console.log(`  → ${entry.tag}: nezapsaná a v DB není, nechávám migrátoru`);
    continue;
  }

  insertRecord.run(hash, entry.when);
  inserted += 1;
  console.log(`  + ${entry.tag}: schéma už v DB je → doplňuji chybějící záznam`);
}

console.log(inserted === 0 ? 'Hotovo, nic k doplnění.' : `Hotovo, doplněno záznamů: ${inserted}.`);

sqlite.close();
