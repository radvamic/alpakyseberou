'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { QuizText } from '@/lib/quiz-i18n';

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz';

/** Rámec stránek pro projektor: hlavička, QR „Hraj taky“, jazyk a celá obrazovka. */
export default function QuizBoardLayout({
  t,
  title,
  badge,
  actions,
  onToggleLang,
  children,
}: {
  t: QuizText;
  title: string;
  badge?: string;
  actions?: React.ReactNode;
  onToggleLang: () => void;
  children: React.ReactNode;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] px-6 md:px-12 py-10">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-start justify-between gap-8 mb-12">
          <div>
            <span className="block font-[family-name:var(--font-great-vibes)] text-4xl md:text-5xl text-[#d8b28c] leading-none mb-3">
              Klára &amp; Michal
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-light">{title}</h1>
            <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-3xl text-[#B8A99A] mt-2">
              {t.title}
            </p>
            {badge && (
              <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-[#d8b28c] border border-[#d8b28c]/30 px-3 py-1">
                {badge}
              </span>
            )}
            {actions && <div className="mt-3">{actions}</div>}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="p-2 bg-[#F5F0E8] rounded">
                <QRCodeSVG value={`${SITE_BASE}/kviz`} size={110} level="M" bgColor="#F5F0E8" fgColor="#0A0A0A" />
              </div>
              <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#d8b28c] max-w-[8rem] leading-tight">
                {t.playToo}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onToggleLang}
                className="text-xs tracking-[0.18em] uppercase text-[#d8b28c] border border-[#d8b28c]/30 rounded-full px-4 py-1.5 hover:bg-[#d8b28c]/10 transition-colors"
              >
                {t.lang}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-xs tracking-[0.18em] uppercase text-[#B8A99A] border border-[#2A2520] rounded-full px-4 py-1.5 hover:text-[#d8b28c] hover:border-[#d8b28c]/30 transition-colors"
              >
                {isFullscreen ? t.exitFullscreen : t.fullscreen}
              </button>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
