'use client';

import { motion } from 'framer-motion';

interface FilmFullProps {
  guestName: string;
  photosTaken: number;
}

export default function FilmFull({ guestName, photosTaken }: FilmFullProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-sm"
      >
        {/* Film roll icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-7xl mb-8 select-none"
          aria-hidden
        >
          🎞️
        </motion.div>

        <span className="block font-[family-name:var(--font-great-vibes)] text-2xl text-[#C9A96E] mb-3">
          Film je plný
        </span>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-[#F5F0E8] mb-4">
          Díky, {guestName}!
        </h1>

        <p className="text-[#B8A99A] text-sm leading-relaxed mb-8">
          Vyfotil&lsquo;s celý film — všech {photosTaken} snímků.
          <br />
          Až je vyvoláme, uvidíš výsledek.
        </p>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent mb-8" />

        <p className="text-[#4A4540] text-xs">
          26. září 2026 · Hotel Všetice
        </p>
      </motion.div>
    </div>
  );
}
