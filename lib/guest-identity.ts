import { z } from 'zod';

/**
 * Identita hosta pro kvíz a jednorázový fotoaparát.
 *
 * Hosté se identifikují jménem a příjmením. Samotné jméno nestačí, dva
 * „Petrové“ by jinak sdíleli jeden film nebo jedno skóre. Aby se host
 * poznal i po překlepu ve velikosti písmen nebo bez diakritiky, porovnává
 * se normalizovaný klíč, ne text tak, jak ho host napsal.
 */

export const GUEST_IDENTITY_STORAGE_KEY = 'guest-identity';

export interface GuestIdentity {
  firstName: string;
  lastName: string;
}

/** Sjednotí mezery; velikost písmen a diakritiku zachová (pro zobrazení). */
export function cleanNamePart(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** „  Petr   NOVÁK “ → „petr novak“ */
export function normalizeNamePart(value: string): string {
  return cleanNamePart(value)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export function identityKey(firstName: string, lastName: string): string {
  return `${normalizeNamePart(firstName)}|${normalizeNamePart(lastName)}`;
}

export function formatGuestName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

const namePart = z
  .string()
  .transform(cleanNamePart)
  .pipe(z.string().min(1).max(60));

export const guestIdentitySchema = z.object({
  firstName: namePart,
  lastName: namePart,
});
