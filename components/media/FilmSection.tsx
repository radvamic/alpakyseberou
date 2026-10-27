'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatBytes, formatDuration, mediaUrl, type MediaItem } from '@/lib/media/shared';
import type { MediaLang, MediaTexts } from '@/lib/media/texts';

interface FilmSectionProps {
  items: MediaItem[];
  isAdmin: boolean;
  lang: MediaLang;
  texts: MediaTexts;
  onDelete: (item: MediaItem) => Promise<void>;
}

/**
 * Video od kameramana. Dokud ho admin nenahraje, ukazuje „již brzy“ se
 * slíbeným termínem; potom přehrávač přímo na stránce (bez lightboxu).
 * Telefon přehrává 720p, větší obrazovky 1080p; stáhnout jde originál
 * i obě převedené verze.
 */
export default function FilmSection({ items, isAdmin, lang, texts, onDelete }: FilmSectionProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#2A2520] bg-gradient-to-b from-[#161310] to-[#0f0e0d] px-6 py-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#d8b28c]/40 text-2xl text-[#d8b28c]">
          🎬
        </div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d8b28c]">{texts.film.soon}</p>
        <h2 className="mb-4 font-[family-name:var(--font-playfair)] text-2xl font-light text-[#F5F0E8]">
          {texts.film.title}
        </h2>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#B8A99A]">{texts.film.promise}</p>
      </motion.div>
    );
  }

  const remove = async (item: MediaItem) => {
    if (!window.confirm(texts.lightbox.confirmDelete)) return;
    setDeleting(item.uid);
    try {
      await onDelete(item);
    } catch {
      window.alert(texts.lightbox.deleteFailed);
    } finally {
      setDeleting(null);
    }
  };

  // Nejdřív celý film, pak kratší trailer
  const sorted = [...items].sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-[#B8A99A]">{texts.film.intro}</p>
      {sorted.map((item) => {
        const downloads = [
          { variant: 'download-hd', label: texts.film.hd, size: item.hdSize },
          { variant: 'download-sd', label: texts.film.sd, size: item.sdSize },
          { variant: 'download', label: texts.film.original, size: item.size },
        ] as const;
        return (
          <article key={item.uid}>
            <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light text-[#F5F0E8]">
                {item.fileName.replace(/\.[^.]+$/, '')}
              </h2>
              {item.durationMs && (
                <span className="text-xs tabular-nums text-[#7a6e65]">{formatDuration(item.durationMs)}</span>
              )}
            </div>
            <div className="-mx-4 overflow-hidden border-y border-[#2A2520] bg-[#111111] sm:mx-0 sm:rounded-2xl sm:border">
              <video
                poster={item.hasThumb ? mediaUrl(item.uid, 'preview') : undefined}
                controls
                playsInline
                preload="none"
                style={{ aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9' }}
                className="w-full bg-black"
              >
                {item.sdSize && <source src={mediaUrl(item.uid, 'play-sd')} type="video/mp4" media="(max-width: 767px)" />}
                <source src={mediaUrl(item.uid, 'play')} />
              </video>
              <div className="px-4 py-4">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#7a6e65]">{texts.film.download}</p>
                <div className="grid grid-cols-3 gap-2">
                  {downloads.map(({ variant, label, size }, i) =>
                    size ? (
                      <a
                        key={variant}
                        href={mediaUrl(item.uid, variant)}
                        className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-2 text-center ${
                          i === 0
                            ? 'bg-[#d8b28c] text-[#0A0A0A]'
                            : 'border border-[#d8b28c]/40 text-[#F5F0E8]'
                        }`}
                      >
                        <span className="text-sm font-medium">↓ {label}</span>
                        <span className="text-xs tabular-nums opacity-70">{formatBytes(size, lang)}</span>
                      </a>
                    ) : null,
                  )}
                </div>
                {item.status === 'processing' && (
                  <p className="mt-3 text-xs text-[#d8b28c]">{texts.lightbox.processing}</p>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={deleting === item.uid}
                    className="mt-3 min-h-11 rounded-full border border-red-400/40 px-4 text-sm text-red-300 disabled:opacity-40"
                  >
                    {texts.lightbox.delete}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
      <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-[#7a6e65]">{texts.film.downloadHint}</p>
    </div>
  );
}
