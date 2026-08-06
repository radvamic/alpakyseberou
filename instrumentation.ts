async function runMigrations() {
  try {
    const path = await import('path');
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    const { db, sqlite } = await import('./db');
    const { baselineMigrations } = await import('./db/baseline');

    const migrationsFolder = path.join(process.cwd(), 'db', 'migrations');

    // Musí předcházet migracím: na databázích, kde schéma dotvořily safety nety
    // z db/index.ts, by migrátor padal na už existujících sloupcích — a protože
    // běží v jedné transakci, zablokoval by i všechny budoucí migrace.
    const baseline = baselineMigrations(sqlite, migrationsFolder);
    if (baseline.inserted.length > 0) {
      console.log('[startup] Doplněny záznamy migrací:', baseline.inserted.join(', '));
    }

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
