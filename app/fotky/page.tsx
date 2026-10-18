'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AccessGate from '@/components/media/AccessGate';
import MediaGallery from '@/components/media/MediaGallery';
import UploadPanel from '@/components/media/UploadPanel';
import { useMediaUploader } from '@/hooks/useMediaUploader';
import { GUEST_IDENTITY_STORAGE_KEY, type GuestIdentity } from '@/lib/guest-identity';
import { MEDIA_DEVICE_HEADER, type MediaItem, type MediaListResponse } from '@/lib/media/shared';
import { MEDIA_TEXTS, type MediaLang } from '@/lib/media/texts';
import { getDeviceToken, readPendingCount } from '@/lib/media/uploader';

type AccessState = 'checking' | 'locked' | 'open';

const LANG_KEY = 'media-lang';

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
        <div className="mb-8 flex items-center justify-between text-xs">
          <Link href="/" className="text-[#7a6e65] transition-colors hover:text-[#d8b28c]">
            {texts.back}
          </Link>
          <button
            type="button"
            onClick={switchLang}
            className="rounded-full border border-[#2A2520] px-3 py-1 text-[#B8A99A] hover:border-[#d8b28c]/40"
          >
            {texts.lang}
          </button>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <span className="mb-2 block font-[family-name:var(--font-great-vibes)] text-2xl text-[#d8b28c]">
            Klára &amp; Michal
          </span>
          <h1 className="mb-3 font-[family-name:var(--font-playfair)] text-3xl font-light sm:text-4xl">
            {texts.title}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#B8A99A]">{texts.subtitle}</p>
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
            <section className="mb-14">
              <UploadPanel
                lang={lang}
                texts={texts}
                identity={identity}
                onIdentity={setIdentity}
                uploader={uploader}
                snapshot={snapshot}
                pendingFromLastVisit={pending}
              />
            </section>

            <section>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#2A2520]" />
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light text-[#d8b28c]">
                  {texts.gallery.title}
                </h2>
                <span className="h-px flex-1 bg-[#2A2520]" />
              </div>
              {items === null ? (
                <div className="flex justify-center py-10">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#d8b28c]/20 border-t-[#d8b28c]" />
                </div>
              ) : (
                <MediaGallery
                  items={items}
                  isAdmin={isAdmin}
                  lang={lang}
                  texts={texts}
                  onDelete={deleteItem}
                />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
