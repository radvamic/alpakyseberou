'use client';

import type { QuizText } from '@/lib/quiz-i18n';

export function QuizPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] px-5 pt-8 pb-12">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </main>
  );
}

export function QuizHeader({ t, onToggleLang }: { t: QuizText; onToggleLang: () => void }) {
  return (
    <header className="flex items-start justify-between mb-8">
      <div>
        <span className="block font-[family-name:var(--font-great-vibes)] text-3xl text-[#d8b28c] leading-none">
          Klára &amp; Michal
        </span>
        <p className="mt-2 text-xs tracking-[0.18em] uppercase text-[#B8A99A]">{t.brand}</p>
      </div>
      <button
        type="button"
        onClick={onToggleLang}
        className="mt-1 text-xs tracking-[0.18em] uppercase text-[#d8b28c] border border-[#d8b28c]/30 rounded-full px-3 py-1 hover:bg-[#d8b28c]/10 transition-colors"
      >
        {t.lang}
      </button>
    </header>
  );
}

export function QuizSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#d8b28c] border-t-transparent animate-spin" />
    </div>
  );
}

/** Rohové „závorky“ jako na kartách v adminu a na webu. */
export function Corners({ tone = 'border-[#d8b28c]/40' }: { tone?: string }) {
  return (
    <>
      <span className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${tone}`} />
      <span className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${tone}`} />
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${tone}`} />
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${tone}`} />
    </>
  );
}
