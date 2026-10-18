'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AccessGate from '@/components/media/AccessGate';
import FilmSection from '@/components/media/FilmSection';
import MediaGallery from '@/components/media/MediaGallery';
import UploadPanel from '@/components/media/UploadPanel';
import { useMediaUploader } from '@/hooks/useMediaUploader';
import { GUEST_IDENTITY_STORAGE_KEY, type GuestIdentity } from '@/lib/guest-identity';
import {
  MEDIA_DEVICE_HEADER,
  type MediaCollection,
  type MediaItem,
  type MediaListResponse,
} from '@/lib/media/shared';
import { MEDIA_TEXTS, type MediaLang } from '@/lib/media/texts';
import { getDeviceToken, readPendingCount } from '@/lib/media/uploader';

type AccessState = 'checking' | 'locked' | 'open';

const LANG_KEY = 'media-lang';
const TABS: MediaCollection[] = ['photographer', 'film', 'guests'];
const TAB_HASH: Record<MediaCollection, string> = {
  photographer: 'fotograf',
  film: 'video',
  guests: 'hoste',
};

function readIdentity(): GuestIdentity | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_IDENTITY_STORAGE_KEY) ?? 'null');
    if (parsed?.firstName && parsed?.lastName) {
      return { firstName: String(parsed.firstName), lastName: String(parsed.lastName) };
    }
  } catch {
    // bez localStorage se jméno zadá znovu
  }
  return null;
}

/**
 * Fotky a videa od hostů: nahrávání přímo z telefonu do R2 a společná
 * galerie, kde je vidět, kdo co nahrál, a vybrané soubory jdou stáhnout.
 * Přístup jen se svatebním kódem (lze předat odkazem /fotky?kod=…).
 */
export default function FotkyPage() {
  const [lang, setLang] = useState<MediaLang>('cs');
  const [access, setAccess] = useState<AccessState>('checking');
  const [identity, setIdentity] = useState<GuestIdentity | null>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, setPending] = useState(0);
  const [tab, setTab] = useState<MediaCollection | null>(null);
  const texts = MEDIA_TEXTS[lang];

  const loadGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/media', {
        headers: { [MEDIA_DEVICE_HEADER]: getDeviceToken() },
        cache: 'no-store',
      });
      if (res.status === 401) {
        setAccess('locked');
        return;
      }
      if (!res.ok) return;
      const data: MediaListResponse = await res.json();
      setItems(data.items);
      setIsAdmin(data.isAdmin);
    } catch {
      // další pokus při příštím obnovení
    }
  }, []);

  // Po dokončení souborů obnovit galerii, ale ne po každém zvlášť
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    refreshTimer.current ??= setTimeout(() => {
      refreshTimer.current = null;
      void loadGallery();
    }, 3000);
  }, [loadGallery]);

  const { uploader, snapshot } = useMediaUploader(identity, scheduleRefresh);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'cs') setLang(stored);
    } catch {
      // výchozí čeština
    }
    setIdentity(readIdentity());
    setPending(readPendingCount());
    const syncTabWithHash = () => {
      const fromHash = Object.entries(TAB_HASH).find(([, hash]) => `#${hash}` === window.location.hash);
      if (fromHash) setTab(fromHash[0] as MediaCollection);
    };
    syncTabWithHash();
    window.addEventListener('hashchange', syncTabWithHash);

    const url = new URL(window.location.href);
    const code = url.searchParams.get('kod');
    const check = code
      ? fetch('/api/media/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }).then(async (res) => {
          url.searchParams.delete('kod');
          window.history.replaceState(null, '', url.pathname + url.search + url.hash);
          if (res.ok) return true;
          const fallback = await fetch('/api/media/access').then((r) => r.json());
          return !!fallback.ok;
        })
      : fetch('/api/media/access').then((r) => r.json()).then((d) => !!d.ok);

    check
      .then((ok) => setAccess(ok ? 'open' : 'locked'))
      .catch(() => setAccess('locked'));
    return () => window.removeEventListener('hashchange', syncTabWithHash);
  }, []);

  useEffect(() => {
    if (access === 'open') void loadGallery();
  }, [access, loadGallery]);

  // Dokud se něco nahrává nebo zpracovává, galerie se průběžně obnovuje
  const processing = items?.some((i) => i.status === 'processing') ?? false;
  useEffect(() => {
    if (access !== 'open' || (!processing && !snapshot.active)) return;
    const timer = setInterval(() => void loadGallery(), 10_000);
    return () => clearInterval(timer);
  }, [access, processing, snapshot.active, loadGallery]);

  const switchLang = () => {
    const next = lang === 'cs' ? 'en' : 'cs';
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // jen do zavření stránky
    }
  };

  const byCollection = useMemo(() => {
    const groups: Record<MediaCollection, MediaItem[]> = { photographer: [], film: [], guests: [] };
    for (const item of items ?? []) groups[item.collection].push(item);
    return groups;
  }, [items]);

  // Bez volby z odkazu (#fotograf…) se otevře fotograf, pokud už má fotky
  const activeTab: MediaCollection =
    tab ?? (byCollection.photographer.length > 0 ? 'photographer' : 'guests');

  const changeTab = (value: MediaCollection) => {
    setTab(value);
    window.history.replaceState(null, '', `#${TAB_HASH[value]}`);
  };

  const uploadProps = {
    lang,
    texts,
    identity,
    onIdentity: setIdentity,
    uploader,
    snapshot,
    pendingFromLastVisit: pending,
  };

  const deleteItem = async (item: MediaItem) => {
    const res = await fetch(`/api/media/${item.uid}`, {
      method: 'DELETE',
      headers: { [MEDIA_DEVICE_HEADER]: getDeviceToken() },
    });
    if (!res.ok) throw new Error('delete failed');
    setItems((prev) => prev?.filter((i) => i.uid !== item.uid) ?? prev);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] text-[#F5F0E8]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between text-sm sm:mb-6">
          <Link href="/" className="flex min-h-10 items-center text-[#7a6e65] transition-colors hover:text-[#d8b28c]">
            {texts.back}
          </Link>
          <button
            type="button"
            onClick={switchLang}
            className="min-h-10 rounded-full border border-[#2A2520] px-4 text-[#B8A99A] hover:border-[#d8b28c]/40"
          >
            {texts.lang}
          </button>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center sm:mb-10"
        >
          <span className="mb-1 block font-[family-name:var(--font-great-vibes)] text-xl text-[#d8b28c] sm:mb-2 sm:text-2xl">
            Klára &amp; Michal
          </span>
          <h1 className="mb-2 font-[family-name:var(--font-playfair)] text-[1.7rem] font-light leading-tight sm:mb-3 sm:text-4xl">
            {texts.title}
          </h1>
          <p className="mx-auto max-w-md text-[13px] leading-relaxed text-[#B8A99A] sm:text-sm">{texts.subtitle}</p>
        </motion.header>

        {access === 'checking' && (
          <div className="flex justify-center py-10">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#d8b28c]/20 border-t-[#d8b28c]" />
          </div>
        )}

        {access === 'locked' && (
          <AccessGate texts={texts.access} onGranted={() => setAccess('open')} />
        )}

        {access === 'open' && (
          <>
            <nav
              className="sticky top-0 z-30 -mx-4 mb-5 bg-[#0A0A0A]/90 px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur"
              aria-label={texts.title}
            >
              <div className="mx-auto grid max-w-md grid-cols-3 gap-1 rounded-full border border-[#2A2520] bg-[#111111] p-1">
                {TABS.map((value) => {
                  const count = byCollection[value].length;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => changeTab(value)}
                      aria-pressed={activeTab === value}
                      className={`min-h-11 rounded-full px-2 text-sm transition-colors ${
                        activeTab === value
                          ? 'bg-[#d8b28c] font-medium text-[#0A0A0A]'
                          : 'text-[#B8A99A] hover:text-[#F5F0E8]'
                      }`}
                    >
                      {texts.sections[value]}
                      {count > 0 && <span className="ml-1 text-xs opacity-60">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </nav>

            {items === null ? (
              <div className="flex justify-center py-10">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#d8b28c]/20 border-t-[#d8b28c]" />
              </div>
            ) : activeTab === 'photographer' ? (
              <section>
                <p className="mx-auto mb-6 max-w-md text-center text-sm leading-relaxed text-[#B8A99A]">
                  {texts.photographer.intro}
                </p>
                {isAdmin && (
                  <div className="mb-8">
                    <UploadPanel {...uploadProps} collection="photographer" sectionLabel={texts.sections.photographer} />
                  </div>
                )}
                <MediaGallery
                  items={byCollection.photographer}
                  isAdmin={isAdmin}
                  showGuestFilter={false}
                  emptyText={texts.photographer.empty}
                  lang={lang}
                  texts={texts}
                  onDelete={deleteItem}
                />
              </section>
            ) : activeTab === 'film' ? (
              <section>
                {isAdmin && (
                  <div className="mb-8">
                    <UploadPanel {...uploadProps} collection="film" sectionLabel={texts.sections.film} />
                  </div>
                )}
                <FilmSection
                  items={byCollection.film}
                  isAdmin={isAdmin}
                  lang={lang}
                  texts={texts}
                  onDelete={deleteItem}
                />
              </section>
            ) : (
              <section>
                <p className="mx-auto mb-6 max-w-md text-center text-sm leading-relaxed text-[#B8A99A]">
                  {texts.guestsIntro}
                </p>
                <div className="mb-12">
                  <UploadPanel {...uploadProps} />
                </div>
                <div className="mb-5 flex items-center gap-4">
                  <span className="h-px flex-1 bg-[#2A2520]" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light text-[#d8b28c]">
                    {texts.gallery.title}
                  </h2>
                  <span className="h-px flex-1 bg-[#2A2520]" />
                </div>
                <MediaGallery
                  items={byCollection.guests}
                  isAdmin={isAdmin}
                  lang={lang}
                  texts={texts}
                  onDelete={deleteItem}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
