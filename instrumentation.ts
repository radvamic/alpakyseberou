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
      // Apply stay_duration column directly as fallback
      try {
        const Database = (await import('better-sqlite3')).default;
        const path = await import('path');
        const dbPath = path.join(process.cwd(), 'data', 'wedding.db');
        const sqlite = new Database(dbPath);
        const cols = sqlite.pragma('table_info(rsvps)') as { name: string }[];
        if (!cols.some((c) => c.name === 'stay_duration')) {
          sqlite.exec("ALTER TABLE rsvps ADD COLUMN stay_duration TEXT DEFAULT ''");
          console.log('[startup] Fallback: stay_duration column added.');
        }
        sqlite.close();
      } catch (fallbackErr) {
        console.error('[startup] Fallback migration also failed:', fallbackErr);
      }
    }
  }
}
