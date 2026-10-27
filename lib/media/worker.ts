import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import exifReader from 'exif-reader';
import { sqlite } from '@/db';
import {
  derivedKey,
  getObjectBuffer,
  isR2Configured,
  presignGet,
  putObject,
} from '@/lib/media/r2';

/**
 * Zpracování nahraných souborů na pozadí (běží v Node procesu webu, startuje
 * z instrumentation.ts):
 * - fotka → náhled do mřížky (thumb) a větší verze do prohlížeče (preview),
 * - video → snímek jako náhled + převod na 1080p H.264, které přehraje každý
 *   prohlížeč (originál z iPhonu bývá 4K HEVC, často HDR). Video od
 *   kameramana dostane navíc 720p do telefonu; obě verze jdou i stáhnout.
 *
 * Fotky a videa mají oddělené fronty, aby dlouhé video neblokovalo fotky.
 * Úlohy se zamykají atomicky v SQLite, takže při rolling deployi, kdy chvíli
 * běží dva kontejnery, nezpracují stejný soubor dvakrát.
 */

type Kind = 'photo' | 'video';

interface Job {
  id: number;
  uid: string;
  kind: Kind;
  collection: string;
  original_key: string;
  file_name: string;
  size: number;
  attempts: number;
}

const MAX_ATTEMPTS = 3;
const LEASE_MS: Record<Kind, number> = { photo: 10 * 60_000, video: 4 * 60 * 60_000 };
const IDLE_POLL_MS = 15_000;
const MAX_PHOTO_BYTES = 150 * 1024 * 1024;
const VIDEO_TIMEOUT_MS = 3 * 60 * 60_000;

interface Rendition {
  name: 'play.mp4' | 'play-720.mp4';
  maxSide: number;
  video: string[];
  audioBitrate: string;
}

/** Videa od hostů — hlavně ať jdou rychle přehrát. */
const GUEST_RENDITIONS: Rendition[] = [
  { name: 'play.mp4', maxSide: 1920, video: ['-preset', 'veryfast', '-crf', '23'], audioBitrate: '128k' },
];

/**
 * Video od kameramana se i stahuje, proto pečlivější převod. Strop datového
 * toku drží velikost (~60 MB, resp. ~23 MB na minutu) a plynulé přehrávání
 * přes mobilní data; klíčový snímek po 2 s zrychluje přeskakování.
 */
const FILM_RENDITIONS: Rendition[] = [
  {
    name: 'play.mp4',
    maxSide: 1920,
    video: ['-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '16M', '-g', '50'],
    audioBitrate: '192k',
  },
  {
    name: 'play-720.mp4',
    maxSide: 1280,
    video: ['-preset', 'medium', '-crf', '23', '-maxrate', '3M', '-bufsize', '6M', '-g', '50'],
    audioBitrate: '128k',
  },
];

// Next.js načítá tenhle modul zvlášť pro instrumentation a pro API routy —
// sdílený stav proto žije na globalThis, jinak by se fronta nedala probudit.
const globalState = globalThis as unknown as {
  __mediaWorkerStarted?: boolean;
  __mediaWorkerWake?: EventEmitter;
};
const wake = (globalState.__mediaWorkerWake ??= new EventEmitter());
wake.setMaxListeners(0);

export function startMediaWorker(): void {
  if (globalState.__mediaWorkerStarted) return;
  if (!isR2Configured()) {
    console.warn('[media] R2 není nastavené — zpracování fotek a videí neběží.');
    return;
  }
  globalState.__mediaWorkerStarted = true;
  void runLoop('photo');
  void runLoop('video');
  console.log('[media] Zpracování fotek a videí běží.');
}

/** Probudí frontu hned po dokončení nahrávání (jinak by čekala až IDLE_POLL_MS). */
export function notifyMediaWorker(): void {
  wake.emit('wake');
}

async function runLoop(kind: Kind): Promise<void> {
  for (;;) {
    let job: Job | undefined;
    try {
      job = claimJob(kind);
    } catch (err) {
      console.error('[media] Nelze převzít úlohu:', err);
    }
    if (!job) {
      await waitForWake();
      continue;
    }
    try {
      if (job.kind === 'photo') await processPhoto(job);
      else await processVideo(job);
    } catch (err) {
      handleFailure(job, err);
    }
  }
}

function waitForWake(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      wake.off('wake', done);
      resolve();
    };
    const timer = setTimeout(done, IDLE_POLL_MS);
    wake.on('wake', done);
  });
}

function claimJob(kind: Kind): Job | undefined {
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + LEASE_MS[kind]).toISOString();
  return sqlite
    .prepare(
      `UPDATE media SET locked_until = ?, attempts = attempts + 1
       WHERE id = (
         SELECT id FROM media
         WHERE status = 'processing' AND kind = ? AND attempts < ?
           AND (locked_until IS NULL OR locked_until < ?)
         ORDER BY id LIMIT 1
       )
       RETURNING id, uid, kind, collection, original_key, file_name, size, attempts`,
    )
    .get(lockedUntil, kind, MAX_ATTEMPTS, now.toISOString()) as Job | undefined;
}

function markReady(job: Job, fields: Record<string, string | number | null>): void {
  const columns = Object.keys(fields);
  const assignments = columns.map((c) => `${c} = @${c}`).join(', ');
  sqlite
    .prepare(
      `UPDATE media SET status = 'ready', locked_until = NULL${assignments ? `, ${assignments}` : ''}
       WHERE id = @id AND status = 'processing'`,
    )
    .run({ ...fields, id: job.id });
}

/**
 * Chyba zpracování nikdy neschová soubor: po posledním pokusu se položka
 * zveřejní bez náhledu/převodu a v galerii jde aspoň stáhnout originál.
 */
function handleFailure(job: Job, err: unknown): void {
  // Hláška z ffmpeg obsahuje podepsanou URL — do logu ani DB nepatří
  const message = (err instanceof Error ? err.message : String(err)).replace(/https?:\/\/\S+/g, '<url>');
  console.error(`[media] Zpracování ${job.uid} (${job.file_name}) selhalo, pokus ${job.attempts}:`, message);
  if (job.attempts >= MAX_ATTEMPTS) {
    markReady(job, { processing_error: message.slice(0, 1000) });
    return;
  }
  const retryAt = new Date(Date.now() + 60_000 * job.attempts).toISOString();
  sqlite
    .prepare('UPDATE media SET locked_until = ?, processing_error = ? WHERE id = ?')
    .run(retryAt, message.slice(0, 1000), job.id);
}

// ─── Fotky ───────────────────────────────────────────────────────────────────

async function jpegVariants(input: Buffer) {
  const [thumb, preview] = await Promise.all([
    sharp(input, { failOn: 'none' })
      .rotate()
      .resize(640, 640, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 76, progressive: true, mozjpeg: true })
      .toBuffer(),
    sharp(input, { failOn: 'none' })
      .rotate()
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toBuffer(),
  ]);
  return { thumb, preview };
}

async function uploadVariants(uid: string, input: Buffer) {
  const { thumb, preview } = await jpegVariants(input);
  const thumbKey = derivedKey(uid, 'thumb.jpg');
  const previewKey = derivedKey(uid, 'preview.jpg');
  await Promise.all([
    putObject(thumbKey, thumb, 'image/jpeg', thumb.length),
    putObject(previewKey, preview, 'image/jpeg', preview.length),
  ]);
  return { thumbKey, previewKey };
}

/** Posun pražského času v minutách pro daný okamžik (léto +120, zima +60). */
function pragueOffsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Prague', timeZoneName: 'longOffset' })
    .formatToParts(at)
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name ?? '');
  return match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
}

/**
 * Čas pořízení z EXIFu. EXIF ukládá místní čas bez zóny (exif-reader ho vrátí,
 * jako by byl v UTC). Zónu bereme z OffsetTimeOriginal (iPhone, novější
 * Android), jinak předpokládáme pražský čas — svatba byla v Česku.
 *
 * U fotografky zónu ignorujeme: její fotoaparáty měly hodiny na místní čas,
 * ale zónu +01:00 bez letního času, takže by časy ujely o hodinu.
 */
function exifDate(exif: Buffer | undefined, trustOffset: boolean): string | null {
  if (!exif) return null;
  try {
    const data = exifReader(exif);
    const wallClock = data.Photo?.DateTimeOriginal ?? data.Image?.DateTime;
    if (!(wallClock instanceof Date) || Number.isNaN(wallClock.getTime())) return null;
    const offset = data.Photo?.OffsetTimeOriginal ?? data.Photo?.OffsetTime;
    const match = trustOffset && typeof offset === 'string' ? /^([+-])(\d{2}):(\d{2})$/.exec(offset.trim()) : null;
    const offsetMinutes = match
      ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]))
      : pragueOffsetMinutes(wallClock);
    return new Date(wallClock.getTime() - offsetMinutes * 60_000).toISOString();
  } catch {
    return null;
  }
}

async function processPhoto(job: Job): Promise<void> {
  if (job.size > MAX_PHOTO_BYTES) {
    markReady(job, { processing_error: 'Soubor je na náhled příliš velký.' });
    return;
  }
  const input = await getObjectBuffer(job.original_key);
  let meta: sharp.Metadata;
  try {
    meta = await sharp(input, { failOn: 'none' }).metadata();
  } catch (err) {
    // Typicky HEIC z Androidu — sharp ho na Linuxu neumí. Originál jde stáhnout.
    markReady(job, {
      processing_error: `Formát nejde zobrazit: ${err instanceof Error ? err.message : err}`.slice(0, 1000),
    });
    return;
  }
  const { thumbKey, previewKey } = await uploadVariants(job.uid, input);
  const rotated = (meta.orientation ?? 1) >= 5;
  markReady(job, {
    thumb_key: thumbKey,
    preview_key: previewKey,
    width: (rotated ? meta.height : meta.width) ?? null,
    height: (rotated ? meta.width : meta.height) ?? null,
    taken_at: exifDate(meta.exif, job.collection === 'guests'),
    processing_error: null,
  });
}

// ─── Videa ───────────────────────────────────────────────────────────────────

interface ProbeStream {
  codec_type?: string;
  width?: number;
  height?: number;
  color_transfer?: string;
  tags?: Record<string, string>;
  side_data_list?: { rotation?: number }[];
}

interface ProbeResult {
  streams?: ProbeStream[];
  format?: { duration?: string; tags?: Record<string, string> };
}

function run(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d;
    });
    child.stderr.on('data', (d) => {
      stderr = (stderr + d).slice(-8000);
    });
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} skončil ${signal ?? code}: ${stderr.slice(-600)}`));
    });
  });
}

let zscaleAvailable: Promise<boolean> | null = null;

/** Převod HDR (HLG/PQ z iPhonu) na SDR potřebuje filtr zscale — nemusí být k dispozici. */
function hasZscale(): Promise<boolean> {
  zscaleAvailable ??= run('ffmpeg', ['-hide_banner', '-filters'], 30_000)
    .then(({ stdout }) => /\bzscale\b/.test(stdout))
    .catch(() => false);
  return zscaleAvailable;
}

function parseDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function processVideo(job: Job): Promise<void> {
  const source = await presignGet(job.original_key, { expiresIn: 12 * 60 * 60 });
  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'media-'));
  try {
    let probe: ProbeResult;
    try {
      const { stdout } = await run(
        'ffprobe',
        ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', source],
        5 * 60_000,
      );
      probe = JSON.parse(stdout) as ProbeResult;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        markReady(job, { processing_error: 'Na serveru chybí ffmpeg — video se přehrává jako originál.' });
        return;
      }
      throw err;
    }

    const video = probe.streams?.find((s) => s.codec_type === 'video');
    if (!video) throw new Error('Soubor neobsahuje video stopu.');
    const durationMs = Math.round(Number(probe.format?.duration ?? 0) * 1000) || null;
    const rotation = Math.abs(video.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? Number(video.tags?.rotate ?? 0));
    const portrait = rotation % 180 === 90;
    const width = (portrait ? video.height : video.width) ?? null;
    const height = (portrait ? video.width : video.height) ?? null;
    const tags = { ...probe.format?.tags, ...video.tags };
    const takenAt = parseDate(tags['com.apple.quicktime.creationdate']) ?? parseDate(tags.creation_time);

    const isHdr = ['arib-std-b67', 'smpte2084'].includes(video.color_transfer ?? '');
    const tonemap =
      isHdr && (await hasZscale())
        ? 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,'
        : '';
    const scale = (maxSide: number) =>
      `scale='min(${maxSide},iw)':'min(${maxSide},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`;

    // Náhled — snímek kousek od začátku (úplně první bývá černý)
    const posterPath = path.join(tmp, 'poster.jpg');
    const seek = durationMs && durationMs > 2000 ? '1' : '0';
    await run(
      'ffmpeg',
      ['-v', 'error', '-y', '-ss', seek, '-i', source, '-frames:v', '1', '-vf', `${tonemap}${scale(1920)},format=yuvj420p`, '-q:v', '3', posterPath],
      10 * 60_000,
    );
    const { thumbKey, previewKey } = await uploadVariants(job.uid, await fs.promises.readFile(posterPath));

    // Přehrávací verze — H.264 + AAC, moov na začátku pro okamžité přehrání.
    // Všechny z jednoho průchodu, 4K originál se dekóduje jen jednou.
    const renditions = job.collection === 'film' ? FILM_RENDITIONS : GUEST_RENDITIONS;
    const split = renditions.map((_, i) => `[s${i}]`).join('');
    const filters = [
      `[0:v:0]${tonemap}split=${renditions.length}${split}`,
      ...renditions.map((r, i) => `[s${i}]${scale(r.maxSide)},format=yuv420p[v${i}]`),
    ];
    const outputs = renditions.flatMap((r, i) => [
      '-map', `[v${i}]`, '-map', '0:a:0?',
      '-c:v', 'libx264', ...r.video, '-profile:v', 'high',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-c:a', 'aac', '-b:a', r.audioBitrate, '-ac', '2',
      '-movflags', '+faststart',
      path.join(tmp, r.name),
    ]);
    await run(
      'nice',
      ['-n', '10', 'ffmpeg', '-v', 'error', '-y', '-i', source, '-filter_complex', filters.join(';'), ...outputs],
      VIDEO_TIMEOUT_MS,
    );
    const stored: Partial<Record<Rendition['name'], { key: string; size: number }>> = {};
    for (const r of renditions) {
      const file = path.join(tmp, r.name);
      const key = derivedKey(job.uid, r.name);
      const { size } = await fs.promises.stat(file);
      await putObject(key, fs.createReadStream(file), 'video/mp4', size);
      stored[r.name] = { key, size };
    }

    markReady(job, {
      thumb_key: thumbKey,
      preview_key: previewKey,
      playback_key: stored['play.mp4']?.key ?? null,
      playback_size: stored['play.mp4']?.size ?? null,
      mobile_key: stored['play-720.mp4']?.key ?? null,
      mobile_size: stored['play-720.mp4']?.size ?? null,
      width,
      height,
      duration_ms: durationMs,
      taken_at: takenAt,
      processing_error: null,
    });
  } finally {
    await fs.promises.rm(tmp, { recursive: true, force: true });
  }
}
