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

/** Delší videa se do sdílení nenabízejí — na telefonu by se stahovala celá do paměti. */
const MAX_SHARE_VIDEO_MS = 5 * 60_000;

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

/**
 * Sdílení souboru přes systémovou nabídku telefonu (Instagram, Facebook,
 * WhatsApp…) — Web Share API s soubory. Na počítačích bez podpory se
 * tlačítko neukazuje, tam zůstává stažení.
 */
function canShareFiles(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([new Blob()], 'test.jpg', { type: 'image/jpeg' })] })
    );
  } catch {
    return false;
  }
}

function isShareable(item: MediaItem): boolean {
  if (item.kind === 'photo') return item.hasThumb;
  return (item.durationMs ?? Infinity) <= MAX_SHARE_VIDEO_MS;
}

async function loadShareFile(item: MediaItem): Promise<File> {
  const variant = item.kind === 'photo' ? 'preview' : 'play';
  // Mimo mezipaměť: <img> už tutéž URL načetl bez CORS a prohlížeč by tu
  // odpověď (bez Access-Control-Allow-Origin) použil i pro fetch → chyba CORS
  const res = await fetch(mediaUrl(item.uid, variant), { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const base = item.fileName.replace(/\.[^.]+$/, '') || 'svatba';
  const type = item.kind === 'photo' ? 'image/jpeg' : blob.type || 'video/mp4';
  const ext = item.kind === 'photo' ? 'jpg' : type.includes('quicktime') ? 'mov' : 'mp4';
  return new File([blob], `${base}.${ext}`, { type });
}

/** Velká fotka: hned náhled z mřížky, ostrá verze se načte přes něj. */
function PhotoView({ item, noPreview }: { item: MediaItem; noPreview: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-[#2A2520] p-6 text-center text-sm text-[#7a6e65]">
        {noPreview}
      </div>
    );
  }
  // Náhled i ostrá verze leží přes sebe ve stejném rámečku (object-contain), takže lícují
  return (
    <div className="relative h-full w-full">
      {item.hasThumb && !loaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.uid, 'thumb')}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(item.uid, 'preview')}
        alt=""
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  href,
  disabled,
  tone = 'default',
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  tone?: 'default' | 'primary' | 'danger';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-[#d8b28c] text-[#0A0A0A]'
      : tone === 'danger'
        ? 'border border-red-400/40 text-red-300'
        : 'border border-[#3a332c] text-[#F5F0E8]';
  const className = `flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-opacity disabled:opacity-40 ${toneClass}`;
  if (href) {
    return (
      <a href={href} className={className} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} aria-label={label}>
      {children}
    </button>
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
  const [shareSupported] = useState(canShareFiles);
  const [shareState, setShareState] = useState<{ uid: string; status: 'preparing' | 'ready' } | null>(null);
  const shareFiles = useRef(new Map<string, Promise<File>>());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [dragY, setDragY] = useState(0);

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

  // Sousední fotky se načtou dopředu, aby listování bylo plynulé
  useEffect(() => {
    for (const offset of [1, -1]) {
      const neighbour = items[(index + offset + total) % total];
      if (neighbour?.kind === 'photo' && neighbour.hasThumb) {
        const img = new Image();
        img.src = mediaUrl(neighbour.uid, 'preview');
      }
    }
  }, [index, items, total]);

  // Fotka ke sdílení se připraví hned po otevření — iPhone dovolí sdílet jen
  // bezprostředně po klepnutí, na stahování by se čekat nedalo
  useEffect(() => {
    if (!shareSupported || !item || item.kind !== 'photo' || !isShareable(item)) return;
    if (!shareFiles.current.has(item.uid)) {
      const pending = loadShareFile(item);
      pending.catch(() => shareFiles.current.delete(item.uid));
      shareFiles.current.set(item.uid, pending);
    }
  }, [item, shareSupported]);

  if (!item) return null;

  const share = async () => {
    let pending = shareFiles.current.get(item.uid);
    if (!pending) {
      pending = loadShareFile(item);
      shareFiles.current.set(item.uid, pending);
    }
    setShareState({ uid: item.uid, status: 'preparing' });
    let file: File;
    try {
      file = await pending;
    } catch {
      shareFiles.current.delete(item.uid);
      setShareState(null);
      window.alert(texts.shareFailed);
      return;
    }
    setShareState({ uid: item.uid, status: 'ready' });
    try {
      await navigator.share({ files: [file] });
      setShareState(null);
    } catch (err) {
      const name = (err as DOMException)?.name;
      // NotAllowedError = vypršelo „klepnutí“ během stahování → stačí klepnout znovu
      if (name === 'AbortError') setShareState(null);
      else if (name !== 'NotAllowedError') {
        setShareState(null);
        window.alert(texts.shareFailed);
      }
    }
  };

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
    if (e.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start || item.kind === 'video') return;
    const dy = e.touches[0].clientY - start.y;
    const dx = e.touches[0].clientX - start.x;
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) setDragY(dy);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setDragY(0);
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (dy > 110 && Math.abs(dy) > Math.abs(dx) && item.kind !== 'video') {
      onClose();
      return;
    }
    if (total > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      if (dx > 0) prev();
      else next();
    }
  };

  const taken = formatTaken(item.takenAt ?? item.uploadedAt, lang);
  const sharing = shareState?.uid === item.uid ? shareState.status : null;
  const roundButton =
    'flex h-11 w-11 items-center justify-center rounded-full bg-[#1A1A1A]/80 text-lg text-[#F5F0E8] transition-colors hover:text-[#d8b28c]';

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      style={{ backgroundColor: `rgba(0,0,0,${Math.max(0.4, 1 - dragY / 400)})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-[#1A1A1A]/80 px-3 py-1.5 text-xs tabular-nums text-[#B8A99A]">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={onClose} className={roundButton} aria-label={texts.close}>
          ✕
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-1 py-2 sm:px-16"
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full w-full items-center justify-center transition-transform duration-75"
          style={{ transform: dragY ? `translateY(${dragY}px) scale(${1 - dragY / 2000})` : undefined }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.kind === 'video' ? (
            <video
              key={item.uid}
              src={mediaUrl(item.uid, 'play')}
              poster={item.hasThumb ? mediaUrl(item.uid, 'preview') : undefined}
              controls
              playsInline
              preload="metadata"
              className="max-h-full max-w-full rounded-md bg-black"
            />
          ) : (
            <PhotoView key={item.uid} item={item} noPreview={texts.noPreview} />
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
              className={`${roundButton} absolute left-3 hidden sm:flex`}
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
              className={`${roundButton} absolute right-3 hidden sm:flex`}
              aria-label={texts.next}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="space-y-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div className="min-w-0 text-center sm:text-left">
          <p className="truncate font-[family-name:var(--font-cormorant)] text-lg text-[#F5F0E8]">
            {item.guestName}
          </p>
          <p className="truncate text-xs text-[#7a6e65]">
            {[taken, formatBytes(item.size, lang)].filter(Boolean).join(' · ')}
          </p>
          {item.kind === 'video' && item.status === 'processing' && (
            <p className="text-xs text-[#d8b28c]">{texts.processing}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {canDelete(item) && (
            <IconButton label={texts.delete} onClick={remove} disabled={deleting} tone="danger">
              🗑 <span>{texts.delete}</span>
            </IconButton>
          )}
          {shareSupported && isShareable(item) && (
            <IconButton label={texts.share} onClick={share} disabled={sharing === 'preparing'}>
              ↗ <span>{sharing === 'preparing' ? texts.sharePreparing : texts.share}</span>
            </IconButton>
          )}
          <IconButton label={texts.download} href={mediaUrl(item.uid, 'download')} tone="primary">
            ↓ <span>{texts.download}</span>
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
}
