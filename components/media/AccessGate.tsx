'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MediaTexts } from '@/lib/media/texts';

interface AccessGateProps {
  texts: MediaTexts['access'];
  onGranted: () => void;
}

/** Zadání svatebního kódu — bez něj galerie ani nahrávání nefungují. */
export default function AccessGate({ texts, onGranted }: AccessGateProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/media/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) onGranted();
      else setError(res.status === 403 ? texts.wrong : texts.error);
    } catch {
      setError(texts.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm space-y-4 text-center"
    >
      <p className="text-sm leading-relaxed text-[#B8A99A]">{texts.intro}</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={texts.placeholder}
        aria-label={texts.placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={100}
        className="w-full rounded-lg border border-[#2A2520] bg-[#141414] px-4 py-3 text-center text-lg text-[#F5F0E8] placeholder-[#4A4540] transition-colors focus:border-[#d8b28c] focus:outline-none"
      />
      <button
        type="submit"
        disabled={!code.trim() || loading}
        className="w-full rounded-lg bg-[#d8b28c] py-3 text-lg font-medium text-[#0A0A0A] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? texts.checking : texts.submit}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </motion.form>
  );
}
