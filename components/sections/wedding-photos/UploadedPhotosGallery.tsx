'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoEntry {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

interface CameraPhoto {
  id: number;
  url: string;
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
    expand: 'Zobrazit vše',
    collapse: 'Sbalit',
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
    expand: 'Show all',
    collapse: 'Collapse',
  },
} as const;

type GalleryLabels = (typeof LABELS)[keyof typeof LABELS];

function PhotoGrid({ items }: { items: PhotoEntry[] }) {
  if (items.length === 0) return null;

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {items.map((photo, i) => (
        <motion.div
          key={photo.id}
          className="break-inside-avoid rounded-xl overflow-hidden border border-[#2A2520] hover:border-[#C9A96E]/20 transition-colors duration-500"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: (i % 4) * 0.04 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="" className="w-full" />
          <div className="p-3 bg-[#111111]">
            <p className="text-xs text-[#B8A99A]">{photo.name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CameraSessionCard({
  session,
  labels,
}: {
  session: CameraSession;
  labels: GalleryLabels;
}) {
  const [open, setOpen] = useState(false);
  const cover = session.photos[0];
  if (!cover) return null;

  return (
    <div className="rounded-xl border border-[#2A2520] bg-[#111111] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]/50"
        aria-expanded={open}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1A1A1A]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt=""
            className="h-full w-full object-cover"
          />
          <span className="absolute top-3 right-3 rounded-full bg-[#0A0A0A]/80 px-2.5 py-1 text-[10px] tracking-wider uppercase text-[#C9A96E]">
            {labels.photoCount(session.photos.length)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#2A2520]">
          <p className="font-[family-name:var(--font-cormorant)] text-base text-[#F5F0E8]">
            {session.guestName}
          </p>
          <span className="text-xs text-[#C9A96E] shrink-0">
            {open ? labels.collapse : labels.expand}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open && session.photos.length > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-[#2A2520]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
              {session.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-lg overflow-hidden border border-[#2A2520] aspect-square"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && session.photos.length === 1 && (
        <p className="px-4 pb-3 text-xs text-[#4A4540] text-center">
          {labels.photoCount(1)}
        </p>
      )}
    </div>
  );
}

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
          className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
        >
          <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
          {showGallery ? labels.toggleHide : labels.toggleShow}
          <motion.span
            animate={{ rotate: showGallery ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#C9A96E]"
          >
            ↓
          </motion.span>
          <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
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
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {tabs.map(({ id, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-4 py-2 text-xs tracking-[0.12em] uppercase transition-all duration-300 ${
                    tab === id
                      ? 'bg-[#C9A96E] text-[#0A0A0A] font-semibold'
                      : 'border border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/40'
                  }`}
                >
                  {labels.tabs[id]}
                  {count > 0 && (
                    <span className="ml-1.5 opacity-70">({count})</span>
                  )}
                </button>
              ))}
            </div>

            {loading && (
              <p className="text-center text-sm text-[#B8A99A] py-8">
                …
              </p>
            )}

            {!loading && empty && (
              <p className="text-center text-sm text-[#4A4540] py-8">
                {labels.empty}
              </p>
            )}

            {!loading && data && tab === 'guests' && (
              <PhotoGrid items={data.guests} />
            )}

            {!loading && data && tab === 'table' && (
              <PhotoGrid items={data.tableChallenge} />
            )}

            {!loading && data && tab === 'camera' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {data.camera.map((session) => (
                  <CameraSessionCard
                    key={session.id}
                    session={session}
                    labels={labels}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
