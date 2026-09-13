'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GUEST_IDENTITY_STORAGE_KEY,
  cleanNamePart,
  type GuestIdentity,
} from '@/lib/guest-identity';

export interface GuestIdentityFormTexts {
  firstName: string;
  lastName: string;
  hint: string;
  submit: string;
  loading: string;
  error: string;
}

interface GuestIdentityFormProps {
  texts: GuestIdentityFormTexts;
  onSubmit: (identity: GuestIdentity) => Promise<void>;
  loading: boolean;
}

const INPUT_CLASS =
  'w-full bg-[#141414] border border-[#2A2520] rounded-lg px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:outline-none focus:border-[#d8b28c] transition-colors text-center text-lg';

function readStoredIdentity(): GuestIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_IDENTITY_STORAGE_KEY) ?? 'null');
    if (typeof parsed?.firstName === 'string' && typeof parsed?.lastName === 'string') {
      return { firstName: parsed.firstName, lastName: parsed.lastName };
    }
  } catch {
    // poškozená nebo nedostupná data — formulář zůstane prázdný
  }
  return null;
}

/**
 * Jméno + příjmení, sdílené kvízem i kamerou. Na telefonu si pamatuje
 * poslední zadanou identitu a formulář jí předvyplní (nepřihlašuje sám).
 *
 * Renderuje se až na klientu (kvíz i kamera ho ukážou teprve po kontrole
 * tokenu v localStorage), takže předvyplnění nezpůsobí hydration mismatch.
 */
export default function GuestIdentityForm({ texts, onSubmit, loading }: GuestIdentityFormProps) {
  const [firstName, setFirstName] = useState(() => readStoredIdentity()?.firstName ?? '');
  const [lastName, setLastName] = useState(() => readStoredIdentity()?.lastName ?? '');
  const [error, setError] = useState(false);

  const identity: GuestIdentity = {
    firstName: cleanNamePart(firstName),
    lastName: cleanNamePart(lastName),
  };
  const canSubmit = identity.firstName !== '' && identity.lastName !== '' && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(false);
    try {
      await onSubmit(identity);
      try {
        localStorage.setItem(GUEST_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
      } catch {
        // bez localStorage jen nebude příště předvyplněno
      }
    } catch {
      setError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder={texts.firstName}
        aria-label={texts.firstName}
        maxLength={60}
        autoComplete="given-name"
        autoCapitalize="words"
        className={INPUT_CLASS}
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder={texts.lastName}
        aria-label={texts.lastName}
        maxLength={60}
        autoComplete="family-name"
        autoCapitalize="words"
        className={INPUT_CLASS}
      />
      <p className="text-xs text-[#7a6e65] leading-relaxed">{texts.hint}</p>
      <motion.button
        type="submit"
        disabled={!canSubmit}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-lg font-medium text-[#0A0A0A] bg-[#d8b28c] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-lg"
      >
        {loading ? texts.loading : texts.submit}
      </motion.button>

      {error && <p className="text-red-400 text-sm text-center pt-1">{texts.error}</p>}
    </form>
  );
}
