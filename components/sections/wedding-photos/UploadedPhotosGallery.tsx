'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoEntry {
  id: number;
  name: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface CameraPhoto {
  id: number;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface CameraSession {
  id: number;
  guestName: string;
  photosTaken: number;
  maxPhotos: number;
  createdAt: string;
  photos: CameraPhoto[];
}

interface GalleryData {
  guests: PhotoEntry[];
  tableChallenge: PhotoEntry[];
  camera: CameraSession[];
}

type TabId = 'guests' | 'camera' | 'table';

const LABELS = {
  cs: {
    toggleShow: 'Nahrané fotky',
    toggleHide: 'Skrýt nahrané fotky',
    tabs: {
      guests: 'Fotky od hostů',
      camera: 'Camera challenge',
      table: 'Table challenge',
    },
    empty: 'Zatím tu nic není.',
    photoCount: (n: number) => (n === 1 ? '1 fotka' : n < 5 ? `${n} fotky` : `${n} fotek`),
  },
  en: {
    toggleShow: 'Uploaded photos',
    toggleHide: 'Hide uploaded photos',
    tabs: {
      guests: 'Guest photos',
      camera: 'Camera challenge',
      table: 'Table challenge',
    },
    empty: 'Nothing here yet.',
    photoCount: (n: number) => (n === 1 ? '1 photo' : `${n} photos`),
  },
} as const;

// ─── Lightbox ────────────────────────────────────────────────────────────────

interface LightboxProps {
  photos: { url: string; caption?: string }[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex);
  const total = photos.length;
  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

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
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const current = photos[idx];

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#1A1A1A]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#d8b28c] hover:border-[#d8b28c]/50 transition-all"
        aria-label="Zavřít"
      >
        ✕
      </button>

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-[#B8A99A] bg-[#1A1A1A]/80 px-3 py-1 rounded-full">
          {idx + 1} / {total}
        </div>
      )}

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-[#1A1A1A]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#d8b28c] hover:border-[#d8b28c]/50 transition-all text-lg"
          aria-label="Předchozí"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-[90vw] max-h-[88vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.caption ?? ''}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
          {current.caption && (
            <p className="mt-3 text-sm text-[#B8A99A] font-[family-name:var(--font-cormorant)]">
              {current.caption}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-[#1A1A1A]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#d8b28c] hover:border-[#d8b28c]/50 transition-all text-lg"
          aria-label="Další"
        >
          ›
        </button>
      )}
    </motion.div>
  );
}

// ─── Photo grid (guests / table-challenge) ───────────────────────────────────

function PhotoGrid({ items }: { items: PhotoEntry[] }) {
  const [lightbox, setLightbox] = useState<{ photos: { url: string; caption?: string }[]; index: number } | null>(null);

  if (items.length === 0) return null;

  const lbPhotos = items.map((p) => ({ url: p.url, caption: p.name }));

  return (
    <>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {items.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => setLightbox({ photos: lbPhotos, index: i })}
            className="break-inside-avoid w-full rounded-xl overflow-hidden border border-[#2A2520] hover:border-[#d8b28c]/30 transition-colors duration-300 text-left group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: (i % 4) * 0.04 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt=""
              className="w-full group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
            <div className="p-2.5 bg-[#111111]">
              <p className="text-xs text-[#B8A99A] truncate">{photo.name}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.photos}
            initialIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Camera session card ─────────────────────────────────────────────────────

function CameraSessionCard({
  session,
  labels,
  onOpenLightbox,
}: {
  session: CameraSession;
  labels: (typeof LABELS)[keyof typeof LABELS];
  onOpenLightbox: (index: number) => void;
}) {
  const cover = session.photos[0];
  if (!cover) return null;

  return (
    <div className="rounded-xl border border-[#2A2520] bg-[#111111] overflow-hidden">
      {/* Cover — click opens lightbox at index 0 */}
      <button
        type="button"
        onClick={() => onOpenLightbox(0)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b28c]/50 group"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1A1A1A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.thumbnailUrl || cover.url}
            alt=""
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute top-2 right-2 rounded-full bg-[#0A0A0A]/80 px-2.5 py-1 text-[10px] tracking-wider uppercase text-[#d8b28c]">
            {labels.photoCount(session.photos.length)}
          </span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="w-10 h-10 rounded-full bg-[#0A0A0A]/70 border border-[#d8b28c]/60 flex items-center justify-center text-[#d8b28c] text-xl">
              ⊕
            </span>
          </span>
        </div>
        <div className="px-4 py-3 border-t border-[#2A2520]">
          <p className="font-[family-name:var(--font-cormorant)] text-base text-[#F5F0E8]">
            {session.guestName}
          </p>
        </div>
      </button>

      {/* Strip of remaining thumbnails */}
      {session.photos.length > 1 && (
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto scrollbar-thin">
          {session.photos.slice(1, 7).map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpenLightbox(i + 1)}
              className="shrink-0 w-14 h-14 rounded overflow-hidden border border-[#2A2520] hover:border-[#d8b28c]/40 transition-colors focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl || photo.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
          {session.photos.length > 7 && (
            <button
              type="button"
              onClick={() => onOpenLightbox(7)}
              className="shrink-0 w-14 h-14 rounded border border-[#2A2520] bg-[#1A1A1A] flex items-center justify-center text-[10px] text-[#d8b28c] font-semibold hover:border-[#d8b28c]/40 transition-colors"
            >
              +{session.photos.length - 7}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Camera tab ──────────────────────────────────────────────────────────────

function CameraTab({ sessions, labels }: { sessions: CameraSession[]; labels: (typeof LABELS)[keyof typeof LABELS] }) {
  const [lightbox, setLightbox] = useState<{ session: CameraSession; index: number } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <CameraSessionCard
            key={session.id}
            session={session}
            labels={labels}
            onOpenLightbox={(index) => setLightbox({ session, index })}
          />
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.session.photos.map((p) => ({ url: p.url }))}
            initialIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function UploadedPhotosGallery({
  locale,
  refreshKey = 0,
}: {
  locale: 'cs' | 'en';
  refreshKey?: number;
}) {
  const labels = LABELS[locale];
  const [showGallery, setShowGallery] = useState(false);
  const [tab, setTab] = useState<TabId>('guests');
  const [data, setData] = useState<GalleryData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((json: GalleryData) => setData(json))
      .catch(() => setData({ guests: [], tableChallenge: [], camera: [] }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showGallery) load();
  }, [showGallery, load, refreshKey]);

  const tabs: { id: TabId; count: number }[] = [
    { id: 'guests', count: data?.guests.length ?? 0 },
    { id: 'camera', count: data?.camera.length ?? 0 },
    { id: 'table', count: data?.tableChallenge.length ?? 0 },
  ];

  const empty =
    !loading &&
    data &&
    ((tab === 'guests' && data.guests.length === 0) ||
      (tab === 'camera' && data.camera.length === 0) ||
      (tab === 'table' && data.tableChallenge.length === 0));

  return (
    <div className="mt-16 border-t border-[#2A2520] pt-10">
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={() => setShowGallery((v) => !v)}
          className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#d8b28c] transition-colors duration-300"
        >
          <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
          {showGallery ? labels.toggleHide : labels.toggleShow}
          <motion.span
            animate={{ rotate: showGallery ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#d8b28c]"
          >
            ↓
          </motion.span>
          <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
        </button>
      </div>

      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {tabs.map(({ id, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-4 py-2 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                    tab === id
                      ? 'bg-[#d8b28c] text-[#0A0A0A] font-semibold'
                      : 'border border-[#2A2520] text-[#B8A99A] hover:border-[#d8b28c]/40'
                  }`}
                >
                  {labels.tabs[id]}
                  {count > 0 && <span className="ml-1.5 opacity-70">({count})</span>}
                </button>
              ))}
            </div>

            {loading && (
              <p className="text-center text-sm text-[#B8A99A] py-8">…</p>
            )}

            {!loading && empty && (
              <p className="text-center text-sm text-[#4A4540] py-8">{labels.empty}</p>
            )}

            {!loading && data && tab === 'guests' && <PhotoGrid items={data.guests} />}
            {!loading && data && tab === 'table' && <PhotoGrid items={data.tableChallenge} />}
            {!loading && data && tab === 'camera' && (
              <CameraTab sessions={data.camera} labels={labels} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
