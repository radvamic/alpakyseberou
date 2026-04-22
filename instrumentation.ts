export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const path = await import('path');
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    const { db } = await import('./db');

    const migrationsFolder = path.join(process.cwd(), 'db', 'migrations');

    console.log('[startup] Running DB migrations from', migrationsFolder);
    migrate(db, { migrationsFolder });
    console.log('[startup] Migrations complete.');
  }
}
