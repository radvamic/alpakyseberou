'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { DARES, type Dare, type Level, type Lang } from '@/data/ukoly';

// ─── helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(level: Level): Dare[] {
  return shuffle(DARES.filter((d) => d.level === level));
}

// ─── translations ────────────────────────────────────────────────────────────

const T = {
  cs: {
    title: 'Stolní úkoly',
    subtitle: 'Naskenuj, losuj, splň — a nezapomeň na fotodůkaz!',
    mild: 'Mírné',
    wild: 'Odvážné',
    mildBadge: 'Mírný úkol',
    wildBadge: 'Odvážný úkol',
    draw: 'Vylosovat úkol',
    next: 'Další úkol',
    emptyHint: 'Vyber obtížnost a vylosuj svůj první úkol.',
    poolLeft: (n: number) => `Zbývá ${n} úkolů`,
    proofTitle: 'Fotodůkaz',
    proofDesc: 'Splnil/a jsi úkol? Vyfoť důkaz a pošli ho do galerie!',
    proofBtn: 'Vyfoť důkaz',
    proofUploading: 'Nahrávám…',
    proofUploadingHint: 'Počkej chvilku, fotka se ukládá do galerie.',
    proofDone: 'Důkaz uložen do galerie!',
    proofError: 'Nepodařilo se nahrát, zkus to znovu.',
    nameLabel: 'Tvoje jméno (volitelné)',
    namePlaceholder: 'Anonym',
    lang: 'EN',
    qrTitle: 'QR kód pro tisk',
    qrDesc: 'Tento QR kód přesměruje na tuto stránku. Vytiskni ho a polož na každý stůl.',
  },
  en: {
    title: 'Table Dares',
    subtitle: 'Scan, draw, complete — and don\'t forget the photo proof!',
    mild: 'Mild',
    wild: 'Wild',
    mildBadge: 'Mild dare',
    wildBadge: 'Wild dare',
    draw: 'Draw a dare',
    next: 'Next dare',
    emptyHint: 'Pick a difficulty and draw your first dare.',
    poolLeft: (n: number) => `${n} dares left`,
    proofTitle: 'Photo Proof',
    proofDesc: 'Completed the dare? Snap the proof and add it to the gallery!',
    proofBtn: 'Take proof photo',
    proofUploading: 'Uploading…',
    proofUploadingHint: 'Hang on — your photo is being saved to the gallery.',
    proofDone: 'Proof saved to gallery!',
    proofError: 'Upload failed, please try again.',
    nameLabel: 'Your name (optional)',
    namePlaceholder: 'Anonymous',
    lang: 'CZ',
    qrTitle: 'QR code for printing',
    qrDesc: 'This QR code links to this page. Print it and place it on every table.',
  },
} as const;

// ─── component ───────────────────────────────────────────────────────────────

export default function UkolyPage() {
  const [lang, setLang] = useState<Lang>('cs');
  const [level, setLevel] = useState<Level>('mild');
  const [pool, setPool] = useState<Dare[]>(() => buildPool('mild'));
  const [current, setCurrent] = useState<Dare | null>(null);
  const [flipKey, setFlipKey] = useState(0);

  const [guestName, setGuestName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'done' | 'error'>('idle');

  const [showQr, setShowQr] = useState(false);
  const [pageUrl, setPageUrl] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const t = T[lang];

  useEffect(() => {
    setPageUrl(window.location.origin + '/ukoly');
  }, []);

  const handleLevelChange = useCallback((next: Level) => {
    setLevel(next);
    setPool(buildPool(next));
    setCurrent(null);
    setFlipKey((k) => k + 1);
    setUploadStatus('idle');
  }, []);

  const draw = useCallback(() => {
    let p = pool;
    if (p.length === 0) {
      p = buildPool(level);
    }
    const [next, ...rest] = p;
    setCurrent(next);
    setPool(rest);
    setFlipKey((k) => k + 1);
    setUploadStatus('idle');

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#C9A96E', '#D6C9A5', '#9E6B6B', '#3B5249', '#F5F0E8'],
    });
  }, [pool, level]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadStatus('idle');

      try {
        const formData = new FormData();
        formData.append('name', guestName.trim() || t.namePlaceholder);
        formData.append('source', 'table-challenge');
        formData.append('photos', file);
        if (current) {
          formData.append('challenge_text', current[lang]);
        }
        const res = await fetch('/api/photos', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('upload failed');
        setUploadStatus('done');
        confetti({
          particleCount: 120,
          spread: 120,
          origin: { y: 0.4 },
          colors: ['#C9A96E', '#D6C9A5', '#9E6B6B', '#3B5249'],
        });
      } catch {
        setUploadStatus('error');
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [guestName, t.namePlaceholder],
  );

  const poolLeft = pool.length;

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center px-4 py-10">
      {/* ── header ── */}
      <header className="w-full max-w-md flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-[family-name:var(--font-great-vibes)] text-4xl text-[#C9A96E] leading-none"
          >
            {t.title}
          </h1>
          <p className="mt-1 text-xs tracking-[0.18em] uppercase text-[#B8A99A]">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setLang((l) => (l === 'cs' ? 'en' : 'cs'))}
          className="mt-1 text-xs tracking-[0.18em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 rounded-full px-3 py-1 hover:bg-[#C9A96E]/10 transition-colors"
        >
          {t.lang}
        </button>
      </header>

      {/* ── level toggle ── */}
      <div className="w-full max-w-md flex gap-2 mb-8">
        {(['mild', 'wild'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleLevelChange(lvl)}
            className={`flex-1 py-2.5 rounded-full text-sm tracking-[0.15em] uppercase transition-all duration-300 ${
              level === lvl
                ? 'bg-[#C9A96E] text-[#0A0A0A] font-semibold shadow-lg shadow-[#C9A96E]/20'
                : 'border border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/40 hover:text-[#C9A96E]'
            }`}
          >
            {lvl === 'mild' ? t.mild : t.wild}
          </button>
        ))}
      </div>

      {/* ── dare card ── */}
      <div className="w-full max-w-md perspective-1000 mb-4">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={flipKey}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative rounded-2xl border border-[#2A2520] bg-[#111111] p-8 min-h-[220px] flex flex-col justify-between"
            >
              <span
                className={`self-start text-[10px] tracking-[0.2em] uppercase font-semibold px-3 py-1 rounded-full mb-4 ${
                  current.level === 'mild'
                    ? 'bg-[#3B5249]/30 text-[#7DAE93] border border-[#3B5249]/40'
                    : 'bg-[#9E6B6B]/20 text-[#C9908A] border border-[#9E6B6B]/30'
                }`}
              >
                {current.level === 'mild' ? t.mildBadge : t.wildBadge}
              </span>

              <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8] text-xl leading-relaxed flex-1 flex items-center">
                {current[lang]}
              </p>

              <p className="mt-6 text-xs text-[#4A4540] text-right">
                {t.poolLeft(poolLeft)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl border border-dashed border-[#2A2520] bg-[#111111] p-8 min-h-[220px] flex flex-col items-center justify-center text-center"
            >
              <span className="text-4xl mb-4 opacity-40">🎲</span>
              <p className="font-[family-name:var(--font-cormorant)] text-[#B8A99A] text-lg leading-relaxed max-w-[260px]">
                {t.emptyHint}
              </p>
              <p className="mt-6 text-xs text-[#4A4540]">
                {t.poolLeft(poolLeft)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── draw / next button ── */}
      <button
        onClick={draw}
        className="w-full max-w-md mb-10 rounded-full border border-[#C9A96E] py-3.5 text-sm tracking-[0.18em] uppercase text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E]/10 active:scale-[0.98]"
      >
        {current ? t.next : t.draw}
      </button>

      {/* ── photo proof ── */}
      {current && (
      <section className="w-full max-w-md rounded-2xl border border-[#2A2520] bg-[#111111] p-6 mb-8">
        <h2 className="font-[family-name:var(--font-cormorant)] text-[#C9A96E] text-lg font-semibold tracking-[0.12em] uppercase mb-1">
          {t.proofTitle}
        </h2>
        <p className="text-xs text-[#B8A99A] mb-4 leading-relaxed">{t.proofDesc}</p>

        {/* optional name */}
        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder={t.namePlaceholder}
          aria-label={t.nameLabel}
          disabled={uploading}
          className="w-full mb-3 rounded-xl border border-[#2A2520] bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#3A3530] focus:border-[#C9A96E]/50 focus:outline-none transition-colors disabled:opacity-40"
        />

        {/* hidden file input — triggers camera on mobile */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleUpload}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-busy={uploading}
          className="w-full rounded-full border border-[#C9A96E]/60 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E]/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading && (
            <span
              className="h-4 w-4 shrink-0 rounded-full border-2 border-[#C9A96E]/30 border-t-[#C9A96E] animate-spin"
              aria-hidden
            />
          )}
          {uploading ? t.proofUploading : t.proofBtn}
        </button>

        <AnimatePresence>
          {uploading && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 overflow-hidden"
              role="status"
              aria-live="polite"
            >
              <div className="rounded-xl border border-[#C9A96E]/20 bg-[#C9A96E]/5 px-4 py-4 flex items-center gap-4">
                <span
                  className="h-10 w-10 shrink-0 rounded-full border-2 border-[#C9A96E]/25 border-t-[#C9A96E] animate-spin"
                  aria-hidden
                />
                <div className="text-left min-w-0">
                  <p className="text-sm text-[#C9A96E] font-medium tracking-wide">
                    {t.proofUploading}
                  </p>
                  <p className="text-xs text-[#B8A99A] mt-1 leading-relaxed">
                    {t.proofUploadingHint}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-[#2A2520]">
                <motion.div
                  className="h-full bg-[#C9A96E]"
                  initial={{ width: '0%' }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!uploading && uploadStatus !== 'idle' && (
            <motion.p
              key={uploadStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 text-center text-sm ${
                uploadStatus === 'done' ? 'text-[#7DAE93]' : 'text-[#C9908A]'
              }`}
            >
              {uploadStatus === 'done' ? t.proofDone : t.proofError}
            </motion.p>
          )}
        </AnimatePresence>
      </section>
      )}

      {/* ── QR section (collapsible) ── */}
      <section className="w-full max-w-md">
        <button
          onClick={() => setShowQr((v) => !v)}
          className="w-full flex items-center justify-between rounded-2xl border border-[#2A2520] bg-[#111111] px-6 py-4 text-left"
        >
          <span className="font-[family-name:var(--font-cormorant)] text-[#B8A99A] text-base tracking-[0.1em] uppercase">
            {t.qrTitle}
          </span>
          <motion.span
            animate={{ rotate: showQr ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-[#C9A96E] text-sm"
          >
            ↓
          </motion.span>
        </button>

        <AnimatePresence>
          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              style={{ overflow: 'hidden' }}
              className="rounded-b-2xl border-x border-b border-[#2A2520] bg-[#111111] px-6 pb-6"
            >
              <p className="text-xs text-[#B8A99A] mb-4 leading-relaxed pt-2">
                {t.qrDesc}
              </p>
              {pageUrl && (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-xl bg-white p-3 inline-block">
                    <QRCodeSVG
                      value={pageUrl}
                      size={160}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#0A0A0A"
                    />
                  </div>
                  <p className="text-[10px] text-[#4A4540] break-all text-center">
                    {pageUrl}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── footer branding ── */}
      <p className="mt-12 text-[10px] tracking-[0.2em] uppercase text-[#2A2520]">
        Klára & Michal · 26. 9. 2026
      </p>
    </main>
  );
}
