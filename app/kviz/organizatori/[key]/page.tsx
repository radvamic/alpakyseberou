'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import QuizBoardLayout from '@/components/quiz/QuizBoardLayout';
import { Corners, QuizSpinner } from '@/components/quiz/QuizUi';
import { usePolledJson } from '@/hooks/usePolledJson';
import { useQuizLang } from '@/hooks/useQuizPlayer';
import { QUIZ_T, localized } from '@/lib/quiz-i18n';
import { OPTION_LETTERS, type QuizResults } from '@/lib/quiz-types';

const REFRESH_MS = 10_000;

/**
 * Plné výsledky pro organizátory: pořadí, správnost po otázkách a správné
 * odpovědi. Bez hesla, ale na neveřejné adrese z adminu — hráčům ji nedávat.
 */
export default function KvizOrganizerResultsPage() {
  const { key } = useParams<{ key: string }>();
  const { lang, toggleLang } = useQuizLang();
  const t = QUIZ_T[lang];
  const { data, error, notFound } = usePolledJson<QuizResults>(
    `/api/quiz/results/${encodeURIComponent(key)}`,
    REFRESH_MS,
  );

  const total = data?.questions.length ?? 0;

  return (
    <QuizBoardLayout
      t={t}
      title={t.resultsTitle}
      badge={t.organizerBadge}
      actions={
        !notFound && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs tracking-[0.12em] uppercase">
            <Link href={`/kviz/organizatori/${key}/otazky`} className="text-[#7a6e65] hover:text-[#d8b28c] transition-colors">
              Upravit otázky a QR kódy →
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
        )
      }
      onToggleLang={toggleLang}
    >
      {notFound && <p className="text-center text-xl text-[#B8A99A] py-20">{t.invalidLink}</p>}
      {!notFound && !data && !error && <QuizSpinner />}
      {!notFound && !data && error && <p className="text-center text-xl text-[#B8A99A] py-20">{t.loadError}</p>}

      {data && (
        <>
          <section className="mb-16">
            {data.players.length === 0 ? (
              <p className="text-center font-[family-name:var(--font-cormorant)] text-3xl text-[#7a6e65] italic py-16">
                {t.noPlayers}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xl md:text-2xl">
                    <thead>
                      <tr className="border-b border-[#2A2520] text-[#7a6e65] text-sm md:text-base uppercase tracking-[0.12em]">
                        <th className="py-3 pr-4 text-left font-normal">#</th>
                        <th className="py-3 pr-6 text-left font-normal">{t.colPlayer}</th>
                        {data.questions.map((q) => (
                          <th key={q.id} className="py-3 px-2 text-center font-normal">
                            <span className="block">{q.number}</span>
                            <span className="block text-[#d8b28c] normal-case">{OPTION_LETTERS[q.correctOption]}</span>
                          </th>
                        ))}
                        <th className="py-3 px-4 text-right font-normal whitespace-nowrap">{t.colCorrect}</th>
                        <th className="py-3 pl-4 text-right font-normal whitespace-nowrap">{t.colAnswered}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.players.map((p, i) => (
                        <tr key={p.id} className="border-b border-[#1a1a1a]">
                          <td
                            className={`py-3 pr-4 font-[family-name:var(--font-playfair)] ${
                              i < 3 ? 'text-[#d8b28c]' : 'text-[#5a5248]'
                            }`}
                          >
                            {i + 1}.
                          </td>
                          <td className="py-3 pr-6 whitespace-nowrap font-[family-name:var(--font-playfair)]">{p.name}</td>
                          {data.questions.map((q) => {
                            const cell = p.cells[q.id];
                            return (
                              <td key={q.id} className="py-3 px-2 text-center">
                                {cell === undefined ? (
                                  <span className="text-[#2A2520]">·</span>
                                ) : cell ? (
                                  <span className="text-emerald-400">✓</span>
                                ) : (
                                  <span className="text-red-400/80">✗</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[#d8b28c]">
                              {p.correct}
                            </span>
                            <span className="text-[#5a5248] text-base md:text-xl"> / {total}</span>
                          </td>
                          <td className="py-3 pl-4 text-right whitespace-nowrap text-[#B8A99A]">
                            {p.answered} / {total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm md:text-base text-[#5a5248]">
                  {t.playerCount(data.players.length)} · {t.tieNote}
                </p>
              </>
            )}
          </section>

          <section>
            <h2 className="text-sm md:text-lg tracking-[0.2em] uppercase text-[#d8b28c] mb-6">{t.correctAnswers}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.questions.map((q) => {
                const correct = q.options[q.correctOption];
                return (
                  <div key={q.id} className="relative border border-[#d8b28c]/15 p-5 md:p-6 flex gap-5">
                    <Corners />
                    <span className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#d8b28c] leading-none w-12 shrink-0">
                      {q.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[#B8A99A] text-base md:text-lg leading-snug mb-2">
                        {localized(lang, q.questionCs, q.questionEn)}
                      </p>
                      {correct && (
                        <p className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl">
                          <span className="text-[#d8b28c]">{OPTION_LETTERS[q.correctOption]})</span>{' '}
                          {localized(lang, correct.cs, correct.en)}
                        </p>
                      )}
                      <p className="mt-2 text-sm md:text-base text-[#7a6e65]">
                        {t.successRate(q.correctCount, q.answeredCount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </QuizBoardLayout>
  );
}
