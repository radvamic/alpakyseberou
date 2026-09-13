'use client';

import { motion } from 'framer-motion';
import GuestIdentityForm from '@/components/guest/GuestIdentityForm';
import type { GuestIdentity } from '@/lib/guest-identity';

interface NameEntryProps {
  onSubmit: (identity: GuestIdentity) => Promise<void>;
  loading: boolean;
}

const FORM_TEXTS = {
  firstName: 'Jméno',
  lastName: 'Příjmení',
  hint: 'Příjmení potřebujeme, aby dva stejní Petrové neměli jeden film.',
  submit: 'Začít fotit',
  loading: 'Načítám…',
  error: 'Něco se pokazilo. Zkus to znovu.',
};

export default function NameEntry({ onSubmit, loading }: NameEntryProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm text-center"
      >
        <span className="block font-[family-name:var(--font-great-vibes)] text-2xl text-[#d8b28c] mb-3">
          Klára &amp; Michal
        </span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-light text-[#F5F0E8] mb-2">
          Jednorázový fotoaparát
        </h1>
        <p className="text-[#B8A99A] text-sm mb-10 leading-relaxed">
          Máš 25 fotek. Foť co chceš — zásnuby, tance, objetí, srandy.
          <br />
          My to pak vyvoláme.
        </p>

        <GuestIdentityForm texts={FORM_TEXTS} onSubmit={onSubmit} loading={loading} />

        <p className="mt-8 text-[#4A4540] text-xs">
          26. září 2026 · Hotel Všetice
        </p>
      </motion.div>
    </div>
  );
}
