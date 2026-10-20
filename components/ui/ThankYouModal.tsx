'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n';
import { setSmoothScrollPaused } from '@/components/providers/SmoothScrollProvider';

const SEEN_KEY = 'thanks-seen';
// ?dekujeme v adrese ukáže poděkování znovu (náhled pro nás)
const PREVIEW_PARAM = 'dekujeme';

function wasSeen(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has(PREVIEW_PARAM)) return false;
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // bez localStorage se poděkování ukáže i příště
  }
}

function hasModalHistoryEntry(): boolean {
  return Boolean((window.history.state as { thanksModal?: boolean } | null)?.thanksModal);
}

/**
 * Poděkování hostům po svatbě: ukáže se jednou na zařízení, hned po preloaderu.
 * Hlavní tlačítko vede rovnou na /fotky, tlačítko zpět v telefonu okno jen zavře.
 */
export default function ThankYouModal({ ready }: { ready: boolean }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(wasSeen);
  const open = ready && !dismissed;

  const close = useCallback(() => {
    markSeen();
    setDismissed(true);
    if (hasModalHistoryEntry()) window.history.back();
  }, []);

  const openPhotos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    markSeen();
    // Nahradí záznam okna v historii — zpět z fotek vede rovnou na web
    window.location.replace('/fotky');
  };

  useEffect(() => {
    if (!open) return;

    setSmoothScrollPaused(true);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    // Vlastní záznam v historii, aby tlačítko zpět zavřelo okno a neodešlo z webu
    if (!hasModalHistoryEntry()) {
      window.history.pushState({ ...window.history.state, thanksModal: true }, '');
    }
    const onPopState = () => {
      markSeen();
      setDismissed(true);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
      html.style.overflow = prevOverflow;
      setSmoothScrollPaused(false);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || reduceMotion) return;
    const timer = setTimeout(() => {
      const shared = {
        particleCount: 60,
        spread: 70,
        startVelocity: 38,
        ticks: 220,
        scalar: 0.9,
        colors: ['#d8b28c', '#e8c9a0', '#f1d5c4', '#F5F0E8', '#c6706d'],
        disableForReducedMotion: true,
      };
      void confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.75 } });
      void confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.75 } });
    }, 450);
    return () => clearTimeout(timer);
  }, [open, reduceMotion]);

  const paragraphs = t('thanks.paragraphs') as string[];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="thanks"
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" onClick={close} aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-title"
            className="relative flex w-full max-w-md max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-[#d8b28c]/25 bg-[#141414] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Zlatá záře nahoře a jemný vnitřní rámeček jako u přáníčka */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(216,178,140,0.2),transparent_70%)]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-2 rounded-[22px] border border-[#d8b28c]/10"
              aria-hidden="true"
            />

            <button
              type="button"
              onClick={close}
              aria-label={t('thanks.close') as string}
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-[#B8A99A] transition-colors hover:bg-[#d8b28c]/10 hover:text-[#F5F0E8]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>

            <div
              className="relative flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-6 text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8 sm:pt-8"
              data-lenis-prevent
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/alpacas/web/preloader.png"
                alt=""
                width={184}
                height={103}
                className="mx-auto h-auto w-[184px] sm:w-[216px] object-contain"
              />

              <h2
                id="thanks-title"
                className="gold-shimmer mt-2 font-[family-name:var(--font-great-vibes)] text-[2.5rem] leading-[1.15] sm:text-[2.75rem]"
              >
                {t('thanks.greeting') as string}
              </h2>
              <p className="text-base" aria-hidden="true">
                🤍 🦙
              </p>

              <div className="my-4 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#d8b28c]/60" />
                <span className="text-xs text-[#d8b28c]">♡</span>
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#d8b28c]/60" />
              </div>

              <div className="space-y-3 font-[family-name:var(--font-cormorant)] text-[1.15rem] sm:space-y-4 sm:text-[1.2rem] leading-relaxed text-balance text-[#F5F0E8]/90">
                {paragraphs.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>

              <p className="mt-6 text-[0.7rem] uppercase tracking-[0.3em] text-[#B8A99A]">
                {t('thanks.signoff') as string}
              </p>
              <p className="mt-1 font-[family-name:var(--font-great-vibes)] text-[2.1rem] leading-tight text-[#d8b28c]">
                {t('thanks.signature') as string}
              </p>
            </div>

            <div className="relative border-t border-[#2A2520] px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {/* Náznak, že text pokračuje, když se na malý displej nevejde */}
              <div
                className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#141414] to-transparent"
                aria-hidden="true"
              />
              <a
                href="/fotky"
                onClick={openPhotos}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#d8b28c] px-6 py-4 text-sm font-medium uppercase tracking-[0.15em] text-[#0A0A0A] transition-colors duration-300 hover:bg-[#e6c4a2] active:bg-[#e6c4a2]"
              >
                📸 {t('thanks.photosCta') as string}
              </a>
              <button
                type="button"
                onClick={close}
                className="mt-1 w-full py-3 text-sm tracking-wide text-[#B8A99A] transition-colors hover:text-[#F5F0E8]"
              >
                {t('thanks.continue') as string}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
