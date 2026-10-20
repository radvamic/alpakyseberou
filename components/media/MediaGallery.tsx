'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MediaLightbox from '@/components/media/MediaLightbox';
import { fileExtension, formatDuration, mediaUrl, type MediaItem } from '@/lib/media/shared';
import type { MediaLang, MediaTexts } from '@/lib/media/texts';

interface MediaGalleryProps {
  items: MediaItem[];
  isAdmin: boolean;
  /** Filtr podle hostů a „Moje“ — u fotografa nedává smysl. */
  showGuestFilter?: boolean;
  emptyText?: string;
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
  // Poměr stran zlehka omezený, aby panoramata a úzké výřezy nerozbily řádek
  const ratio = item.width && item.height ? Math.min(2.5, Math.max(0.5, item.width / item.height)) : 1;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ flexGrow: ratio, flexBasis: `calc(var(--row-h) * ${ratio})` }}
      className={`group relative overflow-hidden bg-[#1A1A1A] focus:outline-none sm:rounded-md focus-visible:ring-2 focus-visible:ring-[#d8b28c] ${
        selected ? 'ring-2 ring-inset ring-[#d8b28c]' : ''
      }`}
      aria-pressed={selecting ? selected : undefined}
    >
      <span className="block" style={{ paddingBottom: `${100 / ratio}%` }} />
      {item.hasThumb && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(item.uid, 'thumb')}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            selected ? 'scale-[0.92]' : ''
          }`}
        />
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-[10px] text-[#7a6e65]">
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
          className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm ${
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

export default function MediaGallery({
  items,
  isAdmin,
  showGuestFilter = true,
  emptyText,
  lang,
  texts,
  onDelete,
}: MediaGalleryProps) {
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
      className={`min-h-10 shrink-0 rounded-full border px-4 text-sm transition-colors ${
        filter === value
          ? 'border-[#d8b28c] bg-[#d8b28c]/10 text-[#d8b28c]'
          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#d8b28c]/40'
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-[#7a6e65]">{emptyText ?? t.empty}</p>;
  }

  return (
    <div className={selecting ? 'pb-28' : ''}>
      {showGuestFilter && guests.length + (mineCount > 0 ? 1 : 0) > 1 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {chip('all', t.all, items.length)}
          {mineCount > 0 && chip('mine', t.mine, mineCount)}
          {guests.map((g) => chip(`guest:${g.key}`, g.name, g.count))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex rounded-full border border-[#2A2520] p-0.5 text-xs">
          {(['taken', 'uploaded'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => changeSort(value)}
              className={`min-h-9 whitespace-nowrap rounded-full px-3 transition-colors ${
                sort === value ? 'bg-[#2A2520] text-[#F5F0E8]' : 'text-[#7a6e65]'
              }`}
            >
              {value === 'taken' ? t.sortTaken : t.sortUploaded}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setSelecting((v) => !v);
            setSelected(new Set());
          }}
          className={`min-h-10 shrink-0 rounded-full border px-4 text-sm ${
            selecting ? 'border-[#d8b28c] text-[#d8b28c]' : 'border-[#2A2520] text-[#F5F0E8]'
          }`}
        >
          {selecting ? t.cancelSelect : t.select}
        </button>
      </div>
      <p className="mb-2 text-xs text-[#7a6e65]">{t.count(shown.length)}</p>

      {/* Mozaika po řádcích: dlaždice mají poměr stran fotky a každý řádek
          se roztáhne na celou šířku, takže fotky na výšku i na šířku jsou celé
          a pořadí podle času zůstává zleva doprava. */}
      <div className="-mx-4 flex flex-wrap gap-0.5 [--row-h:7.5rem] sm:mx-0 sm:gap-1.5 sm:[--row-h:11rem] md:[--row-h:13rem]">
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
        {/* Poslední neúplný řádek se neroztahuje přes celou šířku */}
        <span aria-hidden className="grow-[100] basis-0" />
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
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#F5F0E8]">{t.selected(selectedItems.length, selectedBytes)}</p>
                <button
                  type="button"
                  onClick={toggleAllShown}
                  className="min-h-8 text-sm text-[#d8b28c] underline underline-offset-2"
                >
                  {allShownSelected ? t.selectNone : t.selectAll}
                </button>
              </div>
              <button
                type="button"
                onClick={download}
                disabled={selectedItems.length === 0 || downloading}
                className="min-h-11 shrink-0 rounded-full bg-[#d8b28c] px-5 text-sm font-medium text-[#0A0A0A] disabled:opacity-40"
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
