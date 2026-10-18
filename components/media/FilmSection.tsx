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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-[#B8A99A]">{texts.film.intro}</p>
      {items.map((item) => (
        <div key={item.uid} className="-mx-4 overflow-hidden border-y border-[#2A2520] bg-[#111111] sm:mx-0 sm:rounded-2xl sm:border">
          <video
            src={mediaUrl(item.uid, 'play')}
            poster={item.hasThumb ? mediaUrl(item.uid, 'preview') : undefined}
            controls
            playsInline
            preload="none"
            className="aspect-video w-full bg-black"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="text-xs text-[#7a6e65]">
              {[item.durationMs ? formatDuration(item.durationMs) : null, formatBytes(item.size, lang)]
                .filter(Boolean)
                .join(' · ')}
              {item.status === 'processing' && (
                <span className="block text-[#d8b28c]">{texts.lightbox.processing}</span>
              )}
            </p>
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => remove(item)}
                  disabled={deleting === item.uid}
                  className="min-h-11 rounded-full border border-red-400/40 px-4 text-sm text-red-300 disabled:opacity-40"
                >
                  {texts.lightbox.delete}
                </button>
              )}
              <a
                href={mediaUrl(item.uid, 'download')}
                className="flex min-h-11 items-center rounded-full bg-[#d8b28c] px-5 text-sm font-medium text-[#0A0A0A]"
              >
                ↓ {texts.lightbox.download}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
