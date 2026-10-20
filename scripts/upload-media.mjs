/**
 * Hromadné nahrání fotek od fotografky (nebo videa od kameramana) do galerie
 * /fotky přes stejné API jako nahrávání v prohlížeči: přihlásí se jako admin,
 * každý soubor nahraje po částech přímo do R2 a server pak sám vyrobí náhledy.
 *
 * Spuštění:
 *   node scripts/upload-media.mjs [--site https://alpakyseberou.cz] [--collection photographer] <soubory nebo složky>…
 *
 * Heslo do adminu se bere z ADMIN_PASSWORD, jinak se na něj skript zeptá.
 * Token zařízení se ukládá do ~/.config/alpakyseberou/, takže opakované
 * spuštění hotové soubory přeskočí a přerušené naváže.
 */
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline';

const MEDIA_EXT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', heif: 'image/heif',
  webp: 'image/webp', tif: 'image/tiff', tiff: 'image/tiff', dng: 'image/x-adobe-dng',
  mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v',
};
const FILE_CONCURRENCY = 4;
const RETRIES = 5;

function parseArgs(argv) {
  const opts = { site: 'https://alpakyseberou.cz', collection: 'photographer', paths: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--site') opts.site = argv[++i].replace(/\/$/, '');
    else if (argv[i] === '--collection') opts.collection = argv[++i];
    else opts.paths.push(argv[i]);
  }
  if (!['photographer', 'film'].includes(opts.collection) || opts.paths.length === 0) {
    console.error('Použití: node scripts/upload-media.mjs [--site URL] [--collection photographer|film] <soubory nebo složky>…');
    process.exit(1);
  }
  return opts;
}

function collectFiles(paths) {
  const files = [];
  for (const p of paths) {
    const stat = fs.statSync(p);
    const entries = stat.isDirectory()
      ? fs.readdirSync(p).sort().map((name) => path.join(p, name))
      : [p];
    for (const file of entries) {
      const ext = path.extname(file).slice(1).toLowerCase();
      if (MEDIA_EXT[ext] && fs.statSync(file).isFile()) files.push(file);
    }
  }
  return files;
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

function deviceToken(site) {
  const dir = path.join(os.homedir(), '.config', 'alpakyseberou');
  const file = path.join(dir, `upload-device-${new URL(site).host}`);
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    const token = crypto.randomBytes(24).toString('hex');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, token, { mode: 0o600 });
    return token;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(label, fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= RETRIES || err.fatal) throw err;
      console.warn(`  ${label}: ${err.message} — zkouším znovu (${attempt}/${RETRIES - 1})`);
      await sleep(2000 * attempt);
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const files = collectFiles(opts.paths);
  const totalBytes = files.reduce((sum, f) => sum + fs.statSync(f).size, 0);
  console.log(`${files.length} souborů, ${(totalBytes / 1e9).toFixed(2)} GB → ${opts.site} (${opts.collection})`);

  const password = process.env.ADMIN_PASSWORD || (await askHidden('Heslo do adminu: '));
  const login = await fetch(`${opts.site}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const cookie = login.headers.getSetCookie().find((c) => c.startsWith('admin-auth='))?.split(';')[0];
  if (!login.ok || !cookie) {
    console.error(`Přihlášení se nepovedlo (HTTP ${login.status}).`);
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookie,
    'x-media-device': deviceToken(opts.site),
  };
  const api = async (url, body) => {
    const res = await fetch(`${opts.site}${url}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 409 && res.status !== 410) {
      const err = new Error(`${url} → HTTP ${res.status} ${data.error ?? ''}`);
      err.fatal = res.status >= 400 && res.status < 500;
      throw err;
    }
    return { status: res.status, data };
  };

  async function uploadFile(file) {
    const stat = fs.statSync(file);
    const name = path.basename(file);
    for (;;) {
      const { data: created } = await withRetry(name, () =>
        api('/api/media/uploads', {
          firstName: 'Admin',
          lastName: 'Admin',
          name,
          size: stat.size,
          type: MEDIA_EXT[path.extname(name).slice(1).toLowerCase()],
          lastModified: Math.floor(stat.mtimeMs),
          collection: opts.collection,
        }),
      );
      if (created.state === 'done') return 'skip';

      const { uid, partSize, partCount } = created;
      let missing = [];
      for (let n = 1; n <= partCount; n++) if (!created.uploadedParts.includes(n)) missing.push(n);

      while (missing.length > 0) {
        const fd = await fs.promises.open(file, 'r');
        try {
          for (let i = 0; i < missing.length; i += 100) {
            const batch = missing.slice(i, i + 100);
            const { data: signed } = await withRetry(name, () =>
              api(`/api/media/uploads/${uid}/sign`, { partNumbers: batch }),
            );
            for (const n of batch) {
              const start = (n - 1) * partSize;
              const length = Math.min(partSize, stat.size - start);
              const buffer = Buffer.alloc(length);
              await fd.read(buffer, 0, length, start);
              await withRetry(`${name} část ${n}`, async () => {
                const res = await fetch(signed.urls[n], { method: 'PUT', body: buffer });
                if (!res.ok) throw new Error(`R2 PUT → HTTP ${res.status}`);
              });
            }
          }
        } finally {
          await fd.close();
        }
        const { status, data } = await withRetry(name, () => api(`/api/media/uploads/${uid}/complete`, {}));
        if (status === 410) break; // nahrávání vypršelo — založit znovu
        missing = status === 409 ? data.missing : [];
        if (missing.length === 0) return 'ok';
      }
    }
  }

  let done = 0;
  let uploadedBytes = 0;
  const failed = [];
  const started = Date.now();
  const queue = [...files];
  await Promise.all(
    Array.from({ length: Math.min(FILE_CONCURRENCY, queue.length) }, async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        const size = fs.statSync(file).size;
        let result;
        try {
          result = await uploadFile(file);
        } catch (err) {
          result = 'chyba';
          failed.push(`${file}: ${err.message}`);
        }
        done++;
        uploadedBytes += size;
        const mbps = uploadedBytes / 1e6 / ((Date.now() - started) / 1000);
        console.log(
          `[${done}/${files.length}] ${path.basename(file)} ${result === 'skip' ? '(už nahráno)' : result} · ${mbps.toFixed(1)} MB/s`,
        );
      }
    }),
  );

  console.log(`\nHotovo za ${Math.round((Date.now() - started) / 60000)} min.`);
  if (failed.length > 0) {
    console.error(`Nepovedlo se ${failed.length} souborů (stačí skript pustit znovu):\n${failed.join('\n')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
