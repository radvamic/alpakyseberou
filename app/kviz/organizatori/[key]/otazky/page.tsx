'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QuizAdmin from '@/components/admin/QuizAdmin';
import { QuizSpinner } from '@/components/quiz/QuizUi';
import { QUIZ_ORGANIZER_HEADER, type QuizAdminData } from '@/lib/quiz-types';

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz';
const EMPTY_QUIZ: QuizAdminData = { questions: [], players: [], organizerPath: '' };

type LoadState = 'loading' | 'ready' | 'invalid' | 'error';

/** Správa otázek a QR kódů pro organizátory — bez hesla, na neveřejné adrese. */
export default function KvizOrganizerQuestionsPage() {
  const { key } = useParams<{ key: string }>();
  const [data, setData] = useState<QuizAdminData>(EMPTY_QUIZ);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/quiz', { headers: { [QUIZ_ORGANIZER_HEADER]: key } })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          setState('invalid');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <div className="h-[1px] w-10 bg-gradient-to-r from-[#d8b28c] to-transparent mb-3" />
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-light">Správa kvízu</h1>
            <p className="font-[family-name:var(--font-cormorant)] text-[#7a6e65] text-sm tracking-widest uppercase mt-1">
              Pro organizátory · Klára &amp; Michal 2026
            </p>
          </div>
          {state === 'ready' && (
            <div className="flex flex-wrap gap-5 text-xs tracking-[0.15em] uppercase">
              <Link href={`/kviz/organizatori/${key}`} className="text-[#7a6e65] hover:text-[#d8b28c] transition-colors">
                ← Výsledky
              </Link>
              <a
                href={`/kviz/organizatori/${key}/tisk`}
                target="_blank"
                rel="noreferrer"
                className="text-[#7a6e65] hover:text-[#d8b28c] transition-colors"
              >
                Tisk všech QR kódů →
              </a>
            </div>
          )}
        </div>

        {state === 'loading' && <QuizSpinner />}
        {state === 'invalid' && <p className="text-center text-[#B8A99A] py-20">Neplatný odkaz.</p>}
        {state === 'error' && (
          <p className="text-center text-[#B8A99A] py-20">Nepodařilo se načíst. Zkus stránku obnovit.</p>
        )}
        {state === 'ready' && <QuizAdmin data={data} setData={setData} siteBase={SITE_BASE} organizerKey={key} />}
      </div>
    </main>
  );
}
