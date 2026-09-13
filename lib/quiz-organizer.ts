import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { getAdminPassword, isAdmin } from '@/lib/admin-auth';
import { QUIZ_ORGANIZER_HEADER } from '@/lib/quiz-types';

/**
 * Klíč v neveřejné adrese stránek pro organizátory (/kviz/organizatori/<klíč>).
 *
 * Odvozuje se z hesla do adminu, takže nepotřebuje další konfiguraci,
 * v repozitáři není žádné tajemství a bez znalosti hesla ho nikdo neuhodne.
 * Změna hesla změní i odkaz — organizátorům je pak potřeba poslat nový.
 */
export function getOrganizerKey(): string {
  return createHmac('sha256', getAdminPassword())
    .update('quiz-organizer-results')
    .digest('base64url')
    .slice(0, 24);
}

export function isOrganizerKey(candidate: string): boolean {
  const expected = Buffer.from(getOrganizerKey());
  const given = Buffer.from(candidate);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function getOrganizerPath(): string {
  return `/kviz/organizatori/${getOrganizerKey()}`;
}

/**
 * Správa otázek kvízu: admin (cookie) nebo organizátor (klíč v hlavičce).
 * Mazání hráčů a zbytek administrace zůstává jen adminovi.
 */
export function canManageQuiz(request: NextRequest): boolean {
  if (isAdmin(request)) return true;
  const key = request.headers.get(QUIZ_ORGANIZER_HEADER);
  return key ? isOrganizerKey(key) : false;
}
