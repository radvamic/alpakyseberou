import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  type Part,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 (S3 API). Originály nahrává prohlížeč přímo do R2 přes
 * podepsané URL po částech — přes tenhle server jdou jen náhledy a ZIPy.
 */

interface R2Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function readConfig(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null;
  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

export function isR2Configured(): boolean {
  return readConfig() !== null;
}

let cached: { client: S3Client; bucket: string } | null = null;

function r2(): { client: S3Client; bucket: string } {
  if (cached) return cached;
  const config = readConfig();
  if (!config) {
    throw new Error(
      'R2 není nastavené. Doplň R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID a ' +
        'R2_SECRET_ACCESS_KEY do .env.local (lokálně) nebo do Coolify (produkce).',
    );
  }
  cached = {
    bucket: config.bucket,
    client: new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
      // R2 nepodporuje nové výchozí CRC32 kontrolní součty u podepsaných URL
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    }),
  };
  return cached;
}

export function originalKeyFor(uid: string, ext: string): string {
  return `media/${uid}/original${ext ? `.${ext}` : ''}`;
}

export function derivedKey(uid: string, name: 'thumb.jpg' | 'preview.jpg' | 'play.mp4' | 'play-720.mp4'): string {
  return `media/${uid}/${name}`;
}

export async function createMultipart(key: string, contentType: string): Promise<string> {
  const { client, bucket } = r2();
  const res = await client.send(
    new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
  );
  if (!res.UploadId) throw new Error('R2 nevrátilo UploadId');
  return res.UploadId;
}

/** Všechny už nahrané části. Vrací null, když nahrávání v R2 neexistuje (vypršelo). */
export async function listUploadedParts(key: string, uploadId: string): Promise<Part[] | null> {
  const { client, bucket } = r2();
  const parts: Part[] = [];
  let marker: string | undefined;
  try {
    for (;;) {
      const res = await client.send(
        new ListPartsCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumberMarker: marker,
          MaxParts: 1000,
        }),
      );
      parts.push(...(res.Parts ?? []));
      if (!res.IsTruncated || !res.NextPartNumberMarker) break;
      marker = res.NextPartNumberMarker;
    }
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
  return parts;
}

export async function presignPart(
  key: string,
  uploadId: string,
  partNumber: number,
): Promise<string> {
  const { client, bucket } = r2();
  return getSignedUrl(
    client,
    new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber }),
    { expiresIn: 3600 },
  );
}

export async function completeMultipart(key: string, uploadId: string, parts: Part[]): Promise<void> {
  const { client, bucket } = r2();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .map((p) => ({ PartNumber: p.PartNumber, ETag: p.ETag }))
          .sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0)),
      },
    }),
  );
}

export async function abortMultipart(key: string, uploadId: string): Promise<void> {
  const { client, bucket } = r2();
  try {
    await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }));
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
}

export async function objectSize(key: string): Promise<number | null> {
  const { client, bucket } = r2();
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return res.ContentLength ?? null;
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function getObjectStream(key: string) {
  const { client, bucket } = r2();
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!res.Body) throw new Error(`Prázdné tělo objektu ${key}`);
  return res.Body;
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const body = await getObjectStream(key);
  return Buffer.from(await body.transformToByteArray());
}

export async function putObject(
  key: string,
  body: Buffer | NodeJS.ReadableStream,
  contentType: string,
  contentLength?: number,
): Promise<void> {
  const { client, bucket } = r2();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body as Buffer,
      ContentType: contentType,
      ContentLength: contentLength,
      CacheControl: 'private, max-age=31536000, immutable',
    }),
  );
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const { client, bucket } = r2();
  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
  );
}

const SIGNING_WINDOW_MS = 6 * 60 * 60 * 1000;

/**
 * Podepsaná URL ke čtení. Čas podpisu se zaokrouhluje na 6h okno, takže URL
 * zůstává v okně stejná a prohlížeč může obrázky cachovat.
 */
export async function presignGet(
  key: string,
  options: { downloadName?: string; contentType?: string; expiresIn?: number } = {},
): Promise<string> {
  const { client, bucket } = r2();
  const now = Date.now();
  const signingDate = new Date(Math.floor(now / SIGNING_WINDOW_MS) * SIGNING_WINDOW_MS);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: options.downloadName
        ? contentDisposition(options.downloadName)
        : undefined,
      ResponseContentType: options.contentType,
    }),
    { signingDate, expiresIn: options.expiresIn ?? (2 * SIGNING_WINDOW_MS) / 1000 },
  );
}

export function contentDisposition(fileName: string): string {
  const ascii = fileName.normalize('NFD').replace(/[^\x20-\x7e]/g, '').replace(/["\\]/g, '_') || 'soubor';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

function isNotFound(err: unknown): boolean {
  const e = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
  return (
    e?.name === 'NoSuchUpload' ||
    e?.name === 'NoSuchKey' ||
    e?.name === 'NotFound' ||
    e?.Code === 'NoSuchUpload' ||
    e?.$metadata?.httpStatusCode === 404
  );
}
