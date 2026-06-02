export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const path = await import('path');
      const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
      const { db } = await import('./db');

      const migrationsFolder = path.join(process.cwd(), 'db', 'migrations');

      console.log('[startup] Running DB migrations from', migrationsFolder);
      migrate(db, { migrationsFolder });
      console.log('[startup] Migrations complete.');
    } catch (err) {
      console.error('[startup] Migration failed:', err);
      // Apply schema changes directly as fallback
      try {
        const Database = (await import('better-sqlite3')).default;
        const path = await import('path');
        const dbPath = path.join(process.cwd(), 'data', 'wedding.db');
        const sqlite = new Database(dbPath);

        const rsvpCols = sqlite.pragma('table_info(rsvps)') as { name: string }[];
        if (!rsvpCols.some((c) => c.name === 'stay_duration')) {
          sqlite.exec("ALTER TABLE rsvps ADD COLUMN stay_duration TEXT DEFAULT ''");
          console.log('[startup] Fallback: stay_duration column added.');
        }

        const tables = (sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map(t => t.name);
        if (!tables.includes('camera_sessions')) {
          sqlite.exec(`
            CREATE TABLE camera_sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              guest_name TEXT NOT NULL,
              photos_taken INTEGER NOT NULL DEFAULT 0,
              max_photos INTEGER NOT NULL DEFAULT 25,
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
          `);
          console.log('[startup] Fallback: camera_sessions table created.');
        }
        if (!tables.includes('camera_photos')) {
          sqlite.exec(`
            CREATE TABLE camera_photos (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              session_id INTEGER NOT NULL REFERENCES camera_sessions(id) ON DELETE CASCADE,
              url TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
          `);
          console.log('[startup] Fallback: camera_photos table created.');
        }

        sqlite.close();
      } catch (fallbackErr) {
        console.error('[startup] Fallback migration also failed:', fallbackErr);
      }
    }
  }
}
