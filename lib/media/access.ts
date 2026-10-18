import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { MEDIA_DEVICE_HEADER } from '@/lib/media/shared';

/**
 * Galerie je veřejná (bez kódu). Kdo co nahrál, pozná server podle náhodného
 * tokenu zařízení z localStorage — ukládá se jen jeho hash. Ten opravňuje
 * mazat vlastní soubory a navazovat přerušené nahrávání; admin smí vše.
 */

/** Hash tokenu zařízení z hlavičky, nebo null, když chybí či je nesmyslný. */
export function deviceHash(request: NextRequest): string | null {
  const token = request.headers.get(MEDIA_DEVICE_HEADER);
  if (!token || token.length < 20 || token.length > 200) return null;
  return crypto.createHash('sha256').update(`media-device:${token}`).digest('hex');
}
