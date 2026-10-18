'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import { OPTION_LETTERS, type QuizFinalResults } from '@/lib/quiz-types';

type LoadState = 'loading' | 'ready' | 'error';

export default function QuizResults() {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<QuizFinalResults | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/quiz/final', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<QuizFinalResults>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Bez otázek (nebo když API není dostupné) sekci vůbec neukazujeme.
  if (loadState === 'error' || (data && data.questions.length === 0)) return null;

  const total = data?.questions.length ?? 0;
  const pick = (cs: string, en: string) => (locale === 'en' && en ? en : cs);

  return (
    <section id="quiz" className="relative pt-0 pb-8 bg-[#0A0A0A]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeader
          title={t('quiz.title') as string}
          subtitle={t('quiz.subtitle') as string}
        />

        {/* Expand toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#d8b28c] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
            {expanded ? (t('quiz.hide') as string) : (t('quiz.show') as string)}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#d8b28c]"
            >
              ↓
            </motion.span>
            <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
          </button>
        </div>

        <AnimatePresence>
          {expanded && data && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Leaderboard */}
              <h3 className="text-center font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#d8b28c] mb-6">
                {t('quiz.leaderboard') as string}
              </h3>
              <div className="mx-auto max-w-xl rounded-xl border border-[#2A2520] bg-[#111111] px-5 py-2 mb-3">
                <table className="w-full border-collapse">
                  <tbody>
                    {data.players.map((p, i) => (
                      <tr key={i} className="border-b border-[#1f1c19] last:border-b-0">
                        <td
                          className={`py-3 pr-4 w-10 font-[family-name:var(--font-playfair)] ${
                            i < 3 ? 'text-[#d8b28c]' : 'text-[#5a5248]'
                          }`}
                        >
                          {i + 1}.
                        </td>
                        <td className={`py-3 pr-4 ${i < 3 ? 'text-[#F5F0E8]' : 'text-[#B8A99A]'}`}>
                          {p.name}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <span className="font-[family-name:var(--font-playfair)] text-xl text-[#d8b28c]">
                            {p.correct}
                          </span>
                          <span className="text-sm text-[#5a5248]"> / {total}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-center text-xs text-[#5a5248] mb-16">{t('quiz.tieNote') as string}</p>

              {/* Correct answers */}
              <h3 className="text-center font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#d8b28c] mb-6">
                {t('quiz.answers') as string}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 pb-8">
                {data.questions.map((q) => {
                  const correct = q.options[q.correctOption];
                  const pct = q.answeredCount > 0 ? Math.round((q.correctCount / q.answeredCount) * 100) : null;
                  return (
                    <div
                      key={q.number}
                      className="flex gap-4 rounded-xl border border-[#2A2520] bg-[#111111] p-5"
                    >
                      <span className="font-[family-name:var(--font-playfair)] text-3xl text-[#d8b28c] leading-none w-9 shrink-0">
                        {q.number}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-[#B8A99A] leading-snug mb-2">
                          {pick(q.questionCs, q.questionEn)}
                        </p>
                        {correct && (
                          <p className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-[#F5F0E8]">
                            <span className="text-[#d8b28c]">{OPTION_LETTERS[q.correctOption]})</span>{' '}
                            {pick(correct.cs, correct.en)}
                          </p>
                        )}
                        {pct !== null && (
                          <p className="mt-1 text-xs text-[#7a6e65]">
                            {(t('quiz.successRate') as string)
                              .replace('{pct}', String(pct))
                              .replace('{correct}', String(q.correctCount))
                              .replace('{answered}', String(q.answeredCount))}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
