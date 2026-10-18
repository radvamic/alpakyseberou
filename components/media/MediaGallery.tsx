'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MediaLightbox from '@/components/media/MediaLightbox';
import { fileExtension, formatDuration, mediaUrl, type MediaItem } from '@/lib/media/shared';
import type { MediaLang, MediaTexts } from '@/lib/media/texts';

interface MediaGalleryProps {
  items: MediaItem[];
  isAdmin: boolean;
  lang: MediaLang;
  texts: MediaTexts;
  onDelete: (item: MediaItem) => Promise<void>;
}

type Filter = 'all' | 'mine' | `guest:${string}`;
type Sort = 'taken' | 'uploaded';

const PAGE = 90;

function timeOf(value: string | null): number {
  const t = value ? Date.parse(value) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

function Tile({
  item,
  texts,
  selecting,
  selected,
  onClick,
}: {
  item: MediaItem;
  texts: MediaTexts['gallery'];
  selecting: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-square overflow-hidden rounded-md bg-[#1A1A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b28c] ${
        selected ? 'ring-2 ring-[#d8b28c]' : ''
      }`}
      aria-pressed={selecting ? selected : undefined}
    >
      {item.hasThumb && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.uid, 'thumb')}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            selected ? 'scale-[0.92]' : ''
          }`}
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-[10px] text-[#7a6e65]">
          {item.status === 'processing' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border border-[#d8b28c]/30 border-t-[#d8b28c]" />
              {texts.processing}
            </>
          ) : (
            <>
              <span className="text-xs uppercase text-[#B8A99A]">{fileExtension(item.fileName) || '?'}</span>
              {texts.noPreview}
            </>
          )}
        </span>
      )}

      {item.kind === 'video' && (
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
          ▶{item.durationMs ? ` ${formatDuration(item.durationMs)}` : ''}
        </span>
      )}

      {selecting && (
        <span
          className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
            selected
              ? 'border-[#d8b28c] bg-[#d8b28c] text-[#0A0A0A]'
              : 'border-white/70 bg-black/30 text-transparent'
          }`}
        >
          ✓
        </span>
      )}
    </button>
  );
}

export default function MediaGallery({ items, isAdmin, lang, texts, onDelete }: MediaGalleryProps) {
  const t = texts.gallery;
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('taken');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(PAGE);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const guests = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const item of items) {
      const entry = map.get(item.guestKey) ?? { name: item.guestName, count: 0 };
      entry.count++;
      map.set(item.guestKey, entry);
    }
    return [...map.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [items]);

  const mineCount = useMemo(() => items.filter((i) => i.mine).length, [items]);

  const shown = useMemo(() => {
    const filtered = items.filter((item) =>
      filter === 'all' ? true : filter === 'mine' ? item.mine : `guest:${item.guestKey}` === filter,
    );
    return filtered.sort((a, b) =>
      sort === 'taken'
        ? timeOf(a.takenAt ?? a.uploadedAt) - timeOf(b.takenAt ?? b.uploadedAt)
        : timeOf(b.uploadedAt) - timeOf(a.uploadedAt),
    );
  }, [items, filter, sort]);

  const changeFilter = (value: Filter) => {
    setFilter(value);
    setVisible(PAGE);
  };
  const changeSort = (value: Sort) => {
    setSort(value);
    setVisible(PAGE);
  };

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible((v) => v + PAGE);
      },
      { rootMargin: '800px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown.length, visible]);

  // Jen položky, které v galerii pořád jsou (smazané z výběru vypadnou)
  const selectedItems = useMemo(() => items.filter((i) => selected.has(i.uid)), [items, selected]);
  const selectedBytes = selectedItems.reduce((sum, i) => sum + i.size, 0);
  const allShownSelected = shown.length > 0 && shown.every((i) => selected.has(i.uid));

  const toggle = (uid: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  const toggleAllShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of shown) {
        if (allShownSelected) next.delete(item.uid);
        else next.add(item.uid);
      }
      return next;
    });

  const download = () => {
    if (selectedItems.length === 0) return;
    formRef.current?.submit();
    setDownloading(true);
    setTimeout(() => setDownloading(false), 4000);
  };

  const chip = (value: Filter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => changeFilter(value)}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        filter === value
          ? 'border-[#d8b28c] bg-[#d8b28c]/10 text-[#d8b28c]'
          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#d8b28c]/40'
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-[#7a6e65]">{t.empty}</p>;
  }

  return (
    <div className={selecting ? 'pb-28' : ''}>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip('all', t.all, items.length)}
        {mineCount > 0 && chip('mine', t.mine, mineCount)}
        {guests.map((g) => chip(`guest:${g.key}`, g.name, g.count))}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <select
          value={sort}
          onChange={(e) => changeSort(e.target.value as Sort)}
          className="rounded-lg border border-[#2A2520] bg-[#141414] px-3 py-1.5 text-xs text-[#B8A99A] focus:outline-none"
        >
          <option value="taken">{t.sortTaken}</option>
          <option value="uploaded">{t.sortUploaded}</option>
        </select>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#7a6e65]">{t.count(shown.length)}</span>
          <button
            type="button"
            onClick={() => {
              setSelecting((v) => !v);
              setSelected(new Set());
            }}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.12em] ${
              selecting ? 'border-[#d8b28c] text-[#d8b28c]' : 'border-[#2A2520] text-[#B8A99A]'
            }`}
          >
            {selecting ? t.cancelSelect : t.select}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-1.5 md:grid-cols-5">
        {shown.slice(0, visible).map((item, i) => (
          <Tile
            key={item.uid}
            item={item}
            texts={t}
            selecting={selecting}
            selected={selected.has(item.uid)}
            onClick={() => (selecting ? toggle(item.uid) : setLightbox(i))}
          />
        ))}
      </div>
      {visible < shown.length && <div ref={sentinel} className="h-10" />}

      {/* Stahování ZIPu do skrytého iframu — stránka (a případné nahrávání) běží dál */}
      <iframe name="media-zip-download" title="download" className="hidden" />
      <form ref={formRef} method="POST" action="/api/media/zip" target="media-zip-download" className="hidden">
        <input type="hidden" name="uids" value={selectedItems.map((i) => i.uid).join(',')} />
      </form>

      <AnimatePresence>
        {selecting && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[150] border-t border-[#2A2520] bg-[#0A0A0A]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur"
          >
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#F5F0E8]">{t.selected(selectedItems.length, selectedBytes)}</p>
                <button
                  type="button"
                  onClick={toggleAllShown}
                  className="text-xs text-[#d8b28c] underline underline-offset-2"
                >
                  {allShownSelected ? t.selectNone : t.selectAll}
                </button>
              </div>
              <button
                type="button"
                onClick={download}
                disabled={selectedItems.length === 0 || downloading}
                className="rounded-full bg-[#d8b28c] px-6 py-2.5 text-sm font-medium text-[#0A0A0A] disabled:opacity-40"
              >
                {downloading ? t.downloadStarting : `↓ ${t.download}`}
              </button>
            </div>
            <p className="mx-auto mt-1 max-w-4xl text-[11px] text-[#7a6e65]">{t.downloadHint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox !== null && shown[lightbox] && (
          <MediaLightbox
            items={shown}
            index={lightbox}
            lang={lang}
            texts={texts.lightbox}
            canDelete={(item) => isAdmin || item.mine}
            onIndex={setLightbox}
            onDelete={async (item) => {
              await onDelete(item);
              if (shown.length <= 1) setLightbox(null);
              else setLightbox((i) => (i === null ? null : Math.min(i, shown.length - 2)));
            }}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
