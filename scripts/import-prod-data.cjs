#!/usr/bin/env node
/**
 * Natáhne data z produkčního API do lokální databáze, aby se dalo vyvíjet
 * nad reálným obsahem.
 *
 * Obsah cílových tabulek NAHRAZUJE (ne slučuje) — po doběhnutí lokální DB
 * odpovídá produkci. Před spuštěním si sám udělá zálohu do data/.
 *
 * Pozor: stahují se jen databázové záznamy, ne soubory z public/uploads.
 * Odkazy na fotky proto lokálně vrátí 404, dokud si soubory nestáhneš zvlášť.
 *
 * Použití:
 *   ADMIN_PASSWORD=... node scripts/import-prod-data.cjs
 *   PROD_URL=https://... ADMIN_PASSWORD=... node scripts/import-prod-data.cjs
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const PROD_URL = (process.env.PROD_URL || 'https://alpakyseberou.cz').replace(/\/$/, '');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DB_PATH = path.join(process.cwd(), 'data', 'wedding.db');

if (!ADMIN_PASSWORD) {
  console.error('Chybí ADMIN_PASSWORD — endpointy /api/admin/* bez něj nepustí dál.');
  process.exit(1);
}

if (!fs.existsSync(DB_PATH)) {
  console.error(`Databáze ${DB_PATH} neexistuje. Spusť nejdřív: npm run db:migrate`);
  process.exit(1);
}

/** Přihlásí se do administrace a vrátí hodnotu cookie pro další požadavky. */
async function login() {
  const response = await fetch(`${PROD_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Přihlášení selhalo (HTTP ${response.status}) — zkontroluj ADMIN_PASSWORD.`);
  }

  const cookie = response.headers.get('set-cookie');
  if (!cookie) throw new Error('Server nevrátil přihlašovací cookie.');

  return cookie.split(';')[0];
}

async function fetchJson(endpoint, cookie) {
  const response = await fetch(`${PROD_URL}${endpoint}`, { headers: { cookie } });
  if (!response.ok) throw new Error(`${endpoint} vrátilo HTTP ${response.status}`);
  return response.json();
}

/** SQLite nemá boolean; API vrací true/false, v DB je 0/1. */
const bool = (value) => (value ? 1 : 0);

async function main() {
  console.log(`Zdroj: ${PROD_URL}`);

  const cookie = await login();
  console.log('Přihlášeno.');

  const [rsvps, guestbook, photos, cameraSessions, photobooth] = await Promise.all([
    fetchJson('/api/rsvp', cookie),
    fetchJson('/api/guestbook', cookie),
    fetchJson('/api/photos', cookie),
    fetchJson('/api/admin/camera', cookie),
    fetchJson('/api/admin/photobooth', cookie),
  ]);

  console.log(
    `Staženo: ${rsvps.length} RSVP, ${guestbook.length} zápisů, ${photos.length} fotek, ` +
      `${cameraSessions.length} camera sessions, ${photobooth.length} photobooth fotek.`,
  );

  const backupPath = DB_PATH.replace(/\.db$/, `.db.backup-pred-importem-${Date.now()}`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`Záloha: ${path.basename(backupPath)}`);

  const sqlite = new Database(DB_PATH);
  sqlite.pragma('foreign_keys = ON');

  const importAll = sqlite.transaction(() => {
    // Pořadí mazání respektuje cizí klíče (potomci první).
    for (const table of [
      'camera_photos',
      'camera_sessions',
      'photos',
      'guestbook_entries',
      'photobooth_photos',
      'rsvps',
    ]) {
      sqlite.prepare(`DELETE FROM ${table}`).run();
      sqlite.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(table);
    }

    const insertRsvp = sqlite.prepare(`
      INSERT INTO rsvps (id, name, email, attending, guests, children, children_count,
                         menu_preference, allergies, song_request, song_never, created_at, stay_duration)
      VALUES (@id, @name, @email, @attending, @guests, @children, @childrenCount,
              @menuPreference, @allergies, @songRequest, @songNever, @createdAt, @stayDuration)
    `);

    for (const r of rsvps) {
      insertRsvp.run({
        id: r.id,
        name: r.name ?? '',
        email: r.email ?? '',
        attending: bool(r.attending),
        guests: r.guests ?? 1,
        children: bool(r.children),
        childrenCount: r.childrenCount ?? 0,
        menuPreference: r.menuPreference ?? '',
        allergies: r.allergies ?? '',
        songRequest: r.songRequest ?? '',
        songNever: r.songNever ?? '',
        createdAt: r.createdAt,
        stayDuration: r.stayDuration ?? '',
      });
    }

    const insertGuestbook = sqlite.prepare(`
      INSERT INTO guestbook_entries (id, name, message, is_public, created_at)
      VALUES (@id, @name, @message, @isPublic, @createdAt)
    `);

    const insertPhoto = sqlite.prepare(`
      INSERT INTO photos (type, guestbook_entry_id, name, url, created_at, thumbnail_url, challenge_text)
      VALUES (@type, @guestbookEntryId, @name, @url, @createdAt, @thumbnailUrl, @challengeText)
    `);

    for (const g of guestbook) {
      insertGuestbook.run({
        id: g.id,
        name: g.name ?? '',
        message: g.message ?? '',
        isPublic: bool(g.isPublic),
        createdAt: g.createdAt,
      });

      // Fotky u zápisu přicházejí jako pole URL, v DB mají vlastní řádky.
      for (const url of g.photos ?? []) {
        insertPhoto.run({
          type: 'guestbook',
          guestbookEntryId: g.id,
          name: g.name ?? '',
          url,
          createdAt: g.createdAt,
          // thumbnail_url i challenge_text jsou NOT NULL DEFAULT '' — null neprojde.
          thumbnailUrl: '',
          challengeText: '',
        });
      }
    }

    for (const p of photos) {
      insertPhoto.run({
        type: p.type ?? 'wedding',
        guestbookEntryId: null,
        name: p.name ?? '',
        url: p.url,
        createdAt: p.createdAt,
        thumbnailUrl: p.thumbnailUrl ?? '',
        challengeText: p.challengeText ?? '',
      });
    }

    const insertSession = sqlite.prepare(`
      INSERT INTO camera_sessions (id, token, guest_name, photos_taken, max_photos, created_at)
      VALUES (@id, @token, @guestName, @photosTaken, @maxPhotos, @createdAt)
    `);

    const insertCameraPhoto = sqlite.prepare(`
      INSERT INTO camera_photos (session_id, url, created_at, thumbnail_url)
      VALUES (@sessionId, @url, @createdAt, @thumbnailUrl)
    `);

    for (const s of cameraSessions) {
      insertSession.run({
        id: s.id,
        token: s.token,
        guestName: s.guestName ?? '',
        photosTaken: s.photosTaken ?? 0,
        maxPhotos: s.maxPhotos ?? 25,
        createdAt: s.createdAt,
      });

      for (const photo of s.photos ?? []) {
        insertCameraPhoto.run({
          sessionId: s.id,
          url: typeof photo === 'string' ? photo : photo.url,
          createdAt: (typeof photo === 'object' && photo.createdAt) || s.createdAt,
          thumbnailUrl: (typeof photo === 'object' && photo.thumbnailUrl) || '',
        });
      }
    }

    const insertPhotobooth = sqlite.prepare(`
      INSERT INTO photobooth_photos (id, user_name, original_photo_url, generated_photo_url,
                                     category, motif_id, is_public, created_at)
      VALUES (@id, @userName, @originalPhotoUrl, @generatedPhotoUrl,
              @category, @motifId, @isPublic, @createdAt)
    `);

    for (const p of photobooth) {
      insertPhotobooth.run({
        id: p.id,
        userName: p.userName ?? '',
        originalPhotoUrl: p.originalPhotoUrl ?? null,
        generatedPhotoUrl: p.generatedPhotoUrl ?? null,
        category: p.category ?? null,
        motifId: p.motifId ?? null,
        isPublic: bool(p.isPublic),
        createdAt: p.createdAt,
      });
    }
  });

  importAll();

  console.log('Stav lokální databáze:');
  for (const table of [
    'rsvps',
    'guestbook_entries',
    'photos',
    'camera_sessions',
    'camera_photos',
    'photobooth_photos',
  ]) {
    const { count } = sqlite.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
    console.log(`  ${table.padEnd(20)} ${count}`);
  }

  sqlite.close();
  console.log('Hotovo.');
}

main().catch((error) => {
  console.error('Import selhal:', error.message);
  process.exit(1);
});
