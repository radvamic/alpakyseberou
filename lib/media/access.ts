import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { normalizeNamePart } from '@/lib/guest-identity';
import { MEDIA_DEVICE_HEADER } from '@/lib/media/shared';

/**
 * Přístup ke galerii fotek a videí hostů.
 *
 * Galerie není veřejná: host jednou zadá svatební kód (nebo přijde z odkazu
 * ?kod=…) a dostane cookie. Admin projde vždy. Kdo co nahrál, pozná server
 * podle náhodného tokenu zařízení z localStorage — ukládá se jen jeho hash.
 */

export const MEDIA_ACCESS_COOKIE = 'media-access';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function galleryCode(): string {
  const code = process.env.GALLERY_CODE;
  if (!code) {
    throw new Error(
      'GALLERY_CODE není nastavené. Doplň ho do .env.local (lokálně) ' +
        'nebo do proměnných prostředí serveru (produkce).',
    );
  }
  return code;
}

/** Kód se porovnává bez ohledu na velikost písmen, diakritiku a mezery. */
function normalizeCode(code: string): string {
  return normalizeNamePart(code).replace(/\s+/g, '');
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function accessToken(): string {
  return sha256(`media-access:${normalizeCode(galleryCode())}`);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function isCodeValid(code: string): boolean {
  return safeEqual(normalizeCode(code), normalizeCode(galleryCode()));
}

export function grantAccess(response: NextResponse): void {
  response.cookies.set(MEDIA_ACCESS_COOKIE, accessToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function hasMediaAccess(request: NextRequest): boolean {
  if (isAdmin(request)) return true;
  const cookie = request.cookies.get(MEDIA_ACCESS_COOKIE)?.value;
  return !!cookie && safeEqual(cookie, accessToken());
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Nejdřív zadejte svatební kód.' }, { status: 401 });
}

/** Hash tokenu zařízení z hlavičky, nebo null, když chybí či je nesmyslný. */
export function deviceHash(request: NextRequest): string | null {
  const token = request.headers.get(MEDIA_DEVICE_HEADER);
  if (!token || token.length < 20 || token.length > 200) return null;
  return sha256(`media-device:${token}`);
}
