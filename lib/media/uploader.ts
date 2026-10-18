'use client';

import type { GuestIdentity } from '@/lib/guest-identity';
import {
  MEDIA_DEVICE_HEADER,
  MAX_MEDIA_SIZE,
  detectKind,
  fileFingerprint,
  type CreateUploadResponse,
  type MediaCollection,
  type MediaKind,
} from '@/lib/media/shared';

/**
 * Nahrávání fotek a videí z prohlížeče přímo do R2.
 *
 * Každý soubor jde po částech (8 MB+) přes podepsané URL. Spolehlivost:
 * - každá část se při chybě opakuje, při výpadku sítě se čeká na připojení,
 * - vypršelá podepsaná URL se vyžádá znovu,
 * - po zavření stránky stačí vybrat stejné soubory znovu — server pozná,
 *   co už má, a pošle se jen zbytek (viz POST /api/media/uploads).
 */

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'skipped' | 'error';

export interface UploadJob {
  id: number;
  file: File;
  fingerprint: string;
  kind: MediaKind;
  collection: MediaCollection;
  status: UploadStatus;
  loaded: number;
  error?: string;
}

export interface UploadSnapshot {
  jobs: readonly UploadJob[];
  totalBytes: number;
  loadedBytes: number;
  totalCount: number;
  doneCount: number;
  skippedCount: number;
  failedCount: number;
  active: boolean;
  offline: boolean;
  bytesPerSecond: number;
}

export interface AddResult {
  added: number;
  duplicates: number;
  unsupported: number;
  tooLarge: number;
}

const FILE_CONCURRENCY = 3;
const PUT_CONCURRENCY = 4;
const SIGN_BATCH = 20;
const MAX_ATTEMPTS = 40;
const DEVICE_KEY = 'media-device-token';
const PENDING_KEY = 'media-pending-uploads';

class HttpError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown> = {},
  ) {
    super(typeof data.error === 'string' ? data.error : `HTTP ${status}`);
  }
}

const isRetryable = (err: unknown) =>
  !(err instanceof HttpError) ||
  err.status === 0 ||
  err.status === 403 || // vypršelá podepsaná URL — podepíše se znovu
  err.status === 408 ||
  err.status === 429 ||
  err.status >= 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitOnline(): Promise<void> {
  if (typeof navigator === 'undefined' || navigator.onLine) return Promise.resolve();
  return new Promise((resolve) => window.addEventListener('online', () => resolve(), { once: true }));
}

async function retrying<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err) || attempt >= MAX_ATTEMPTS) throw err;
      await waitOnline();
      await sleep(Math.min(30_000, 1000 * 2 ** Math.min(attempt - 1, 5)) * (0.75 + Math.random() / 2));
    }
  }
}

class Semaphore {
  private queue: (() => void)[] = [];
  constructor(private free: number) {}
  async acquire(): Promise<() => void> {
    if (this.free > 0) this.free--;
    else await new Promise<void>((resolve) => this.queue.push(resolve));
    return () => {
      const next = this.queue.shift();
      if (next) next();
      else this.free++;
    };
  }
}

function putBlob(url: string, blob: Blob, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new HttpError(xhr.status));
    xhr.onerror = () => reject(new HttpError(0));
    xhr.ontimeout = () => reject(new HttpError(0));
    xhr.timeout = 10 * 60_000;
    xhr.send(blob);
  });
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getDeviceToken(): string {
  const store = storage();
  const existing = store?.getItem(DEVICE_KEY);
  if (existing) return existing;
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '');
  try {
    store?.setItem(DEVICE_KEY, token);
  } catch {
    // bez localStorage platí token jen do zavření stránky
  }
  return token;
}

/** Kolik souborů zůstalo nedonahraných při minulé návštěvě. */
export function readPendingCount(): number {
  try {
    const list = JSON.parse(storage()?.getItem(PENDING_KEY) ?? '[]');
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

export class MediaUploader {
  private jobs: UploadJob[] = [];
  private nextId = 1;
  private running = 0;
  private listeners = new Set<() => void>();
  private snapshot: UploadSnapshot;
  private emitTimer: ReturnType<typeof setTimeout> | null = null;
  private puts = new Semaphore(PUT_CONCURRENCY);
  private samples: { t: number; bytes: number }[] = [];
  private offline = false;
  private identity: GuestIdentity | null = null;
  private onFileFinished: (() => void) | null = null;

  constructor(private deviceToken: string) {
    this.snapshot = this.buildSnapshot();
    if (typeof window !== 'undefined') {
      this.offline = !navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /** Jméno hosta a callback po dokončení souboru — mění se během života stránky. */
  configure(identity: GuestIdentity | null, onFileFinished: () => void) {
    this.identity = identity;
    this.onFileFinished = onFileFinished;
  }

  dispose() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.offline = false;
    this.emit(true);
  };

  private handleOffline = () => {
    this.offline = true;
    this.emit(true);
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  add(files: FileList | File[], collection: MediaCollection = 'guests'): AddResult {
    const result: AddResult = { added: 0, duplicates: 0, unsupported: 0, tooLarge: 0 };
    const known = new Set(this.jobs.filter((j) => j.status !== 'error').map((j) => j.fingerprint));
    for (const file of Array.from(files)) {
      const kind = detectKind(file.type, file.name);
      if (!kind || file.size === 0) {
        result.unsupported++;
        continue;
      }
      if (file.size > MAX_MEDIA_SIZE) {
        result.tooLarge++;
        continue;
      }
      const fingerprint = `${collection}|${fileFingerprint(file)}`;
      if (known.has(fingerprint)) {
        result.duplicates++;
        continue;
      }
      known.add(fingerprint);
      // Chybný pokus o stejný soubor nahradí nový
      this.jobs = this.jobs.filter((j) => j.fingerprint !== fingerprint);
      this.jobs.push({ id: this.nextId++, file, fingerprint, kind, collection, status: 'queued', loaded: 0 });
      result.added++;
    }
    this.savePending();
    this.pump();
    this.emit(true);
    return result;
  }

  retryFailed() {
    for (const job of this.jobs) {
      if (job.status === 'error') {
        job.status = 'queued';
        job.loaded = 0;
        job.error = undefined;
      }
    }
    this.pump();
    this.emit(true);
  }

  /** Odstraní dokončené z přehledu (když nic neběží). */
  clearFinished() {
    this.jobs = this.jobs.filter((j) => j.status === 'queued' || j.status === 'uploading' || j.status === 'error');
    this.samples = [];
    this.emit(true);
  }

  private pump() {
    while (this.running < FILE_CONCURRENCY) {
      const job = this.jobs.find((j) => j.status === 'queued');
      if (!job) break;
      job.status = 'uploading';
      this.running++;
      void this.runJob(job).finally(() => {
        this.running--;
        this.savePending();
        this.pump();
        this.emit(true);
      });
    }
  }

  private async request<T>(url: string, body: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [MEDIA_DEVICE_HEADER]: this.deviceToken },
        body: JSON.stringify(body),
      });
    } catch {
      throw new HttpError(0);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new HttpError(res.status, data);
    return data as T;
  }

  private async runJob(job: UploadJob): Promise<void> {
    try {
      // U fotografa / kameramana jméno určí server, admin ho zadávat nemusí
      const identity =
        this.identity ?? (job.collection === 'guests' ? null : { firstName: 'Admin', lastName: 'Admin' });
      if (!identity) throw new Error('Chybí jméno');
      for (let restart = 0; ; restart++) {
        const created = await retrying(() =>
          this.request<CreateUploadResponse>('/api/media/uploads', {
            ...identity,
            name: job.file.name,
            size: job.file.size,
            type: job.file.type,
            lastModified: job.file.lastModified,
            collection: job.collection,
          }),
        );
        if (created.state === 'done') {
          job.loaded = job.file.size;
          job.status = 'skipped';
          return;
        }
        const { uid, partSize, partCount } = created;
        const uploaded = new Set(created.uploadedParts);
        const sizeOf = (n: number) => Math.min(partSize, job.file.size - (n - 1) * partSize);
        job.loaded = [...uploaded].reduce((sum, n) => sum + sizeOf(n), 0);

        let pending: number[] = [];
        for (let n = 1; n <= partCount; n++) if (!uploaded.has(n)) pending.push(n);

        let expired = false;
        while (!expired) {
          await this.uploadParts(job, uid, partSize, pending);
          try {
            await retrying(() => this.request(`/api/media/uploads/${uid}/complete`, {}));
            job.loaded = job.file.size;
            job.status = 'done';
            this.onFileFinished?.();
            return;
          } catch (err) {
            if (err instanceof HttpError && err.status === 409 && Array.isArray(err.data.missing)) {
              pending = err.data.missing as number[];
              job.loaded -= pending.reduce((sum, n) => sum + sizeOf(n), 0);
              continue;
            }
            if (err instanceof HttpError && err.status === 410 && restart < 2) {
              expired = true;
              continue;
            }
            throw err;
          }
        }
      }
    } catch (err) {
      job.status = 'error';
      job.error = err instanceof Error ? err.message : String(err);
    }
  }

  private async uploadParts(job: UploadJob, uid: string, partSize: number, parts: number[]) {
    const urls = new Map<number, string>();
    let signing: Promise<void> | null = null;
    const queue = [...parts];

    const sign = async (from: number) => {
      const batch = [from, ...queue.filter((n) => !urls.has(n)).slice(0, SIGN_BATCH - 1)];
      const { urls: signed } = await retrying(() =>
        this.request<{ urls: Record<string, string> }>(`/api/media/uploads/${uid}/sign`, {
          partNumbers: batch,
        }),
      );
      for (const [n, url] of Object.entries(signed)) urls.set(Number(n), url);
    };

    const urlFor = async (n: number): Promise<string> => {
      while (!urls.has(n)) {
        signing ??= sign(n).finally(() => {
          signing = null;
        });
        await signing;
      }
      return urls.get(n)!;
    };

    const uploadPart = async (n: number) => {
      const start = (n - 1) * partSize;
      const blob = job.file.slice(start, Math.min(start + partSize, job.file.size));
      await retrying(async () => {
        const url = await urlFor(n);
        const release = await this.puts.acquire();
        let progress = 0;
        try {
          await putBlob(url, blob, (loaded) => {
            job.loaded += loaded - progress;
            progress = loaded;
            this.emit();
          });
          job.loaded += blob.size - progress;
        } catch (err) {
          job.loaded -= progress;
          if (err instanceof HttpError && err.status === 403) urls.delete(n);
          throw err;
        } finally {
          release();
          this.emit();
        }
      });
    };

    let failed = false;
    const lanes = Array.from({ length: Math.min(PUT_CONCURRENCY, queue.length) }, async () => {
      for (let n = queue.shift(); n !== undefined && !failed; n = queue.shift()) {
        try {
          await uploadPart(n);
        } catch (err) {
          failed = true;
          throw err;
        }
      }
    });
    await Promise.all(lanes);
  }

  private savePending() {
    const pending = this.jobs
      .filter((j) => j.status === 'queued' || j.status === 'uploading' || j.status === 'error')
      .map((j) => j.fingerprint);
    try {
      if (pending.length > 0) storage()?.setItem(PENDING_KEY, JSON.stringify(pending));
      else storage()?.removeItem(PENDING_KEY);
    } catch {
      // nevadí — jen se po návratu neukáže upozornění
    }
  }

  private emit(immediate = false) {
    if (immediate) {
      if (this.emitTimer) clearTimeout(this.emitTimer);
      this.emitTimer = null;
      this.flush();
      return;
    }
    this.emitTimer ??= setTimeout(() => {
      this.emitTimer = null;
      this.flush();
    }, 250);
  }

  private flush() {
    this.snapshot = this.buildSnapshot();
    for (const listener of this.listeners) listener();
  }

  private buildSnapshot(): UploadSnapshot {
    let totalBytes = 0;
    let loadedBytes = 0;
    let doneCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let active = false;
    for (const job of this.jobs) {
      totalBytes += job.file.size;
      loadedBytes += Math.max(0, Math.min(job.loaded, job.file.size));
      if (job.status === 'done') doneCount++;
      else if (job.status === 'skipped') skippedCount++;
      else if (job.status === 'error') failedCount++;
      else active = true;
    }

    const now = Date.now();
    this.samples.push({ t: now, bytes: loadedBytes });
    while (this.samples.length > 2 && now - this.samples[0].t > 15_000) this.samples.shift();
    const first = this.samples[0];
    const elapsed = (now - first.t) / 1000;
    const bytesPerSecond = active && elapsed > 2 ? Math.max(0, (loadedBytes - first.bytes) / elapsed) : 0;

    return {
      jobs: [...this.jobs],
      totalBytes,
      loadedBytes,
      totalCount: this.jobs.length,
      doneCount,
      skippedCount,
      failedCount,
      active,
      offline: this.offline,
      bytesPerSecond,
    };
  }
}
