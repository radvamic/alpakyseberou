async function runMigrations() {
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
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Do not block the HTTP server — long migrations or SQLite locks during
  // Coolify rolling deploys caused 504 Gateway Timeout until register() finished.
  void runMigrations();
}
