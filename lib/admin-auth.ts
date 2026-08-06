import { NextRequest } from 'next/server';

/**
 * Heslo do administrace.
 *
 * Záměrně bez fallbacku: dřív se při chybějící proměnné aplikace tiše přepnula
 * na výchozí heslo zakomitované přímo ve zdrojovém kódu. Chybějící konfigurace
 * teď shodí požadavek místo toho, aby pustila dovnitř kohokoli.
 */
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD není nastavené. Doplň ho do .env.local (lokálně) ' +
        'nebo do proměnných prostředí serveru (produkce).',
    );
  }

  return password;
}

export function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin-auth');
  if (!cookie) return false;

  return cookie.value === getAdminPassword();
}
