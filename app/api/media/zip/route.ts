import { once } from 'events';
import { Readable } from 'stream';
import { NextRequest, NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import { ZipArchive } from 'archiver';
import { db } from '@/db';
import { media } from '@/db/schema';
import { forbidden, hasMediaAccess } from '@/lib/media/access';
import { getObjectStream } from '@/lib/media/r2';

const MAX_ITEMS = 20_000;
const COLLECTION_ORDER = { photographer: 0, film: 1, guests: 2 } as const;

function safeSegment(value: string): string {
  return value.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').trim() || 'soubor';
}

/**
 * Stažení vybraných originálů jako jeden ZIP. Odesílá se klasickým formulářem
 * (POST, pole `uids`), aby prohlížeč soubor rovnou ukládal na disk — přes
 * fetch by se celý držel v paměti.
 *
 * ZIP se skládá průběžně: originály se po jednom čtou z R2 a hned odcházejí
 * ke klientovi, bez komprese (fotky a videa jsou už komprimované) a bez
 * mezisouborů na disku. Velikost proto předem neznáme.
 */
export async function POST(request: NextRequest) {
  if (!hasMediaAccess(request)) return forbidden();

  let uids: string[];
  try {
    const form = await request.formData();
    uids = String(form.get('uids') ?? '')
      .split(',')
      .filter((uid) => /^[0-9a-f-]{36}$/.test(uid))
      .slice(0, MAX_ITEMS);
  } catch {
    return NextResponse.json({ error: 'Neplatný požadavek' }, { status: 400 });
  }
  if (uids.length === 0) {
    return NextResponse.json({ error: 'Nic není vybráno' }, { status: 400 });
  }

  const rows: (typeof media.$inferSelect)[] = [];
  for (let i = 0; i < uids.length; i += 500) {
    rows.push(
      ...(await db.select().from(media).where(inArray(media.uid, uids.slice(i, i + 500))).all()),
    );
  }
  const items = rows
    .filter((row) => row.status !== 'uploading')
    .sort(
      (a, b) =>
        COLLECTION_ORDER[a.collection] - COLLECTION_ORDER[b.collection] ||
        a.guestName.localeCompare(b.guestName, 'cs') ||
        a.id - b.id,
    );
  if (items.length === 0) {
    return NextResponse.json({ error: 'Soubory nenalezeny' }, { status: 404 });
  }

  // Jednotlivé soubory do složek podle hostů, stejné názvy se očíslují
  const usedNames = new Set<string>();
  const entries = items.map((row) => {
    const folder = safeSegment(row.guestName);
    const file = safeSegment(row.fileName);
    const dot = file.lastIndexOf('.');
    const base = dot > 0 ? file.slice(0, dot) : file;
    const ext = dot > 0 ? file.slice(dot) : '';
    let name = `${folder}/${file}`;
    for (let n = 2; usedNames.has(name.toLowerCase()); n++) name = `${folder}/${base} (${n})${ext}`;
    usedNames.add(name.toLowerCase());
    const date = new Date(row.takenAt ?? row.uploadedAt ?? row.createdAt);
    return { key: row.originalKey, name, date: Number.isNaN(date.getTime()) ? new Date() : date };
  });

  const archive = new ZipArchive({ store: true });
  archive.on('warning', (err) => console.warn('[media zip] warning:', err));
  archive.on('error', (err) => console.error('[media zip] error:', err));

  // Klient stahování přerušil → archiv se zavře a čtení z R2 se ukončí
  const closed = once(archive, 'close').then(
    () => 'closed' as const,
    () => 'closed' as const,
  );

  void (async () => {
    for (const entry of entries) {
      if (archive.destroyed) return;
      const source = (await getObjectStream(entry.key)) as Readable;
      const finished = once(archive, 'entry').then(() => 'entry' as const);
      archive.append(source, { name: entry.name, date: entry.date });
      if ((await Promise.race([finished, closed])) === 'closed') {
        source.destroy();
        return;
      }
    }
    await archive.finalize();
  })().catch((err) => {
    console.error('[media zip] Skládání ZIPu selhalo:', err);
    archive.destroy(err instanceof Error ? err : new Error(String(err)));
  });

  // toWeb respektuje backpressure: z R2 se čte jen tak rychle, jak klient stahuje
  const body = Readable.toWeb(archive) as ReadableStream<Uint8Array>;

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="svatba-fotky-${stamp}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
