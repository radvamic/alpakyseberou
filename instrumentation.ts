export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    const { db } = await import('@/db');
    const path = await import('path');

    const migrationsFolder = path.join(process.cwd(), 'db', 'migrations');

    console.log('Running database migrations...');
    try {
      migrate(db, { migrationsFolder });
      console.log('Database migrations complete.');
    } catch (error) {
      console.error('Migration error:', error);
    }
  }
}
