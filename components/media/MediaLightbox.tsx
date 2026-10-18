'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatBytes, mediaUrl, type MediaItem } from '@/lib/media/shared';
import type { MediaLang, MediaTexts } from '@/lib/media/texts';

interface MediaLightboxProps {
  items: MediaItem[];
  index: number;
  lang: MediaLang;
  texts: MediaTexts['lightbox'];
  canDelete: (item: MediaItem) => boolean;
  onIndex: (index: number) => void;
  onDelete: (item: MediaItem) => Promise<void>;
  onClose: () => void;
}

function formatTaken(iso: string | null, lang: MediaLang): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-GB', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Velká fotka; formát, který prohlížeč neumí (HEIC z Androidu), nahradí popiskem. */
function PhotoView({ uid, noPreview }: { uid: string; noPreview: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-[#2A2520] text-sm text-[#7a6e65]">
        {noPreview}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl(uid, 'preview')}
      alt=""
      onError={() => setFailed(true)}
      className="max-h-[calc(100dvh-11rem)] max-w-full rounded-lg object-contain shadow-2xl"
    />
  );
}

export default function MediaLightbox({
  items,
  index,
  lang,
  texts,
  canDelete,
  onIndex,
  onDelete,
  onClose,
}: MediaLightboxProps) {
  const item = items[index];
  const total = items.length;
  const [deleting, setDeleting] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const prev = () => onIndex((index - 1 + total) % total);
  const next = () => onIndex((index + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!item) return null;

  const remove = async () => {
    if (!window.confirm(texts.confirmDelete)) return;
    setDeleting(true);
    try {
      await onDelete(item);
    } catch {
      window.alert(texts.deleteFailed);
    } finally {
      setDeleting(false);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || total < 2) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) prev();
      else next();
    }
  };

  const taken = formatTaken(item.takenAt ?? item.uploadedAt, lang);
  const controlClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2520] bg-[#1A1A1A]/80 text-[#B8A99A] transition-all hover:border-[#d8b28c]/50 hover:text-[#d8b28c]';

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-[#1A1A1A]/80 px-3 py-1 text-xs text-[#B8A99A]">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={onClose} className={controlClass} aria-label={texts.close}>
          ✕
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-3 sm:px-16"
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex max-h-full max-w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {item.kind === 'video' ? (
            <video
              key={item.uid}
              src={mediaUrl(item.uid, 'play')}
              poster={item.hasThumb ? mediaUrl(item.uid, 'preview') : undefined}
              controls
              playsInline
              preload="metadata"
              className="max-h-[calc(100dvh-11rem)] max-w-full rounded-lg bg-black"
            />
          ) : (
            <PhotoView key={item.uid} uid={item.uid} noPreview={texts.noPreview} />
          )}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className={`${controlClass} absolute left-3 hidden text-lg sm:flex`}
              aria-label={texts.prev}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className={`${controlClass} absolute right-3 hidden text-lg sm:flex`}
              aria-label={texts.next}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-cormorant)] text-lg text-[#F5F0E8]">
            {item.guestName}
          </p>
          <p className="truncate text-xs text-[#7a6e65]">
            {[taken, item.fileName, formatBytes(item.size, lang)].filter(Boolean).join(' · ')}
          </p>
          {item.kind === 'video' && item.status === 'processing' && (
            <p className="text-xs text-[#d8b28c]">{texts.processing}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {canDelete(item) && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="rounded-full border border-red-400/40 px-4 py-2 text-xs uppercase tracking-[0.12em] text-red-300 disabled:opacity-40"
            >
              {texts.delete}
            </button>
          )}
          <a
            href={mediaUrl(item.uid, 'download')}
            className="rounded-full bg-[#d8b28c] px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#0A0A0A]"
          >
            ↓ {texts.download}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
