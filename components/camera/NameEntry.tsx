'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NameEntryProps {
  onSubmit: (name: string) => Promise<void>;
  loading: boolean;
}

export default function NameEntry({ onSubmit, loading }: NameEntryProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-sm text-center"
      >
        <span className="block font-[family-name:var(--font-great-vibes)] text-2xl text-[#C9A96E] mb-3">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tvoje jméno"
              maxLength={60}
              autoFocus
              className="w-full bg-[#141414] border border-[#2A2520] rounded-lg px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:outline-none focus:border-[#C9A96E] transition-colors text-center text-lg"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!name.trim() || loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-lg font-medium text-[#0A0A0A] bg-[#C9A96E] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-lg"
          >
            {loading ? 'Načítám…' : 'Začít fotit'}
          </motion.button>
        </form>

        <p className="mt-8 text-[#4A4540] text-xs">
          26. září 2026 · Hotel Všetice
        </p>
      </motion.div>
    </div>
  );
}
