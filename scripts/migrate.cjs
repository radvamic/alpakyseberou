#!/usr/bin/env node
// Runs Drizzle migrations before the Next.js server starts.
// Uses CommonJS so it works directly with `node` without tsx or build step.

'use strict';

const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'wedding.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('[migrate] Running database migrations…');
console.log('[migrate] DB path:', DB_PATH);
console.log('[migrate] Migrations dir:', MIGRATIONS_DIR);

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);
migrate(db, { migrationsFolder: MIGRATIONS_DIR });

sqlite.close();
console.log('[migrate] Done.');
