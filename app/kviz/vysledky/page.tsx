'use client';

import QuizBoardLayout from '@/components/quiz/QuizBoardLayout';
import { QuizSpinner } from '@/components/quiz/QuizUi';
import { usePolledJson } from '@/hooks/usePolledJson';
import { useQuizLang } from '@/hooks/useQuizPlayer';
import { QUIZ_T } from '@/lib/quiz-i18n';
import type { QuizPublicProgress } from '@/lib/quiz-types';

const REFRESH_MS = 10_000;

/**
 * Veřejný průběh pro hosty a projektor. Nic o správnosti — plné výsledky
 * jsou na neveřejné stránce pro organizátory (odkaz v adminu).
 */
export default function KvizProgressPage() {
  const { lang, toggleLang } = useQuizLang();
  const t = QUIZ_T[lang];
  const { data, error } = usePolledJson<QuizPublicProgress>('/api/quiz/results', REFRESH_MS);

  return (
    <QuizBoardLayout t={t} title={t.boardTitle} onToggleLang={toggleLang}>
      {!data && !error && <QuizSpinner />}
      {!data && error && <p className="text-center text-xl text-[#B8A99A] py-20">{t.loadError}</p>}

      {data &&
        (data.players.length === 0 ? (
          <p className="text-center font-[family-name:var(--font-cormorant)] text-3xl text-[#7a6e65] italic py-16">
            {t.noPlayers}
          </p>
        ) : (
          <>
            <ul className="grid gap-x-16 lg:grid-cols-2">
              {data.players.map((p) => {
                const pct = data.total > 0 ? Math.min(100, (p.answered / data.total) * 100) : 0;
                return (
                  <li key={p.id} className="flex items-center gap-6 border-b border-[#1a1a1a] py-4">
                    <span className="flex-1 min-w-0 truncate font-[family-name:var(--font-playfair)] text-2xl md:text-3xl">
                      {p.name}
                    </span>
                    <span className="w-28 md:w-44 h-2 rounded-full bg-[#1a1a1a] overflow-hidden shrink-0">
                      <span className="block h-full bg-[#d8b28c]" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-20 shrink-0 text-right text-xl md:text-2xl text-[#B8A99A] whitespace-nowrap">
                      {p.answered} / {data.total}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-sm md:text-base text-[#5a5248]">
              {t.playerCount(data.players.length)} · {t.boardNote}
            </p>
          </>
        ))}
    </QuizBoardLayout>
  );
}
