'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import GuestIdentityForm from '@/components/guest/GuestIdentityForm';
import { QuizHeader, QuizPage, QuizSpinner } from '@/components/quiz/QuizUi';
import { useQuizLang, useQuizPlayer } from '@/hooks/useQuizPlayer';
import { QUIZ_T, localized } from '@/lib/quiz-i18n';
import { OPTION_LETTERS, type QuizPublicQuestion } from '@/lib/quiz-types';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

async function fetchQuestion(
  number: string,
): Promise<{ state: LoadState; question: QuizPublicQuestion | null }> {
  try {
    const res = await fetch(`/api/quiz/questions/${encodeURIComponent(number)}`);
    if (res.status === 404) return { state: 'not-found', question: null };
    if (!res.ok) return { state: 'error', question: null };
    return { state: 'ready', question: await res.json() };
  } catch {
    return { state: 'error', question: null };
  }
}

/** Stanoviště: sem vede QR kód z lístečku. */
export default function KvizQuestionPage() {
  const { number } = useParams<{ number: string }>();
  const { lang, toggleLang } = useQuizLang();
  const t = QUIZ_T[lang];
  const { status, player, registering, register, answer } = useQuizPlayer();

  const [question, setQuestion] = useState<QuizPublicQuestion | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    let cancelled = false;
    fetchQuestion(number).then((result) => {
      if (cancelled) return;
      setQuestion(result.question);
      setLoadState(result.state);
    });
    return () => {
      cancelled = true;
    };
  }, [number, reloadKey]);

  const retry = () => {
    setLoadState('loading');
    setReloadKey((k) => k + 1);
  };

  const choose = async (option: number) => {
    if (!question) return;
    setSaveState('saving');
    try {
      await answer(question.id, option);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const selected = question && player ? player.answers[question.id] : undefined;
  const answeredCount = player ? Object.keys(player.answers).length : 0;

  return (
    <QuizPage>
      <QuizHeader t={t} onToggleLang={toggleLang} />

      {(loadState === 'loading' || (loadState === 'ready' && status === 'loading')) && (
        <QuizSpinner />
      )}

      {loadState === 'not-found' && (
        <section className="text-center py-10">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light mb-3">
            {t.notFoundTitle}
          </h1>
          <p className="text-sm text-[#B8A99A] mb-8">{t.notFoundText}</p>
          <Link href="/kviz" className="text-sm text-[#d8b28c] underline underline-offset-4">
            {t.backToMap}
          </Link>
        </section>
      )}

      {loadState === 'error' && (
        <section className="text-center py-10">
          <p className="text-sm text-[#B8A99A] mb-6">{t.loadError}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-[#d8b28c] px-6 py-2.5 text-sm tracking-[0.15em] uppercase text-[#d8b28c]"
          >
            {t.retry}
          </button>
        </section>
      )}

      {loadState === 'ready' && question && status === 'anonymous' && (
        <section className="text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-[#d8b28c] mb-3">
            {t.questionOf(question.number, question.total)}
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light leading-tight mb-4">
            {t.title}
          </h1>
          <p className="text-[#B8A99A] text-sm mb-6 leading-relaxed">{t.identityIntro}</p>
          <GuestIdentityForm texts={t.form} onSubmit={register} loading={registering} />
        </section>
      )}

      {loadState === 'ready' && question && status === 'ready' && player && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs tracking-[0.2em] uppercase text-[#d8b28c] mb-4">
            {t.questionOf(question.number, question.total)}
          </p>

          {question.imageUrl && (
            <div className="mb-6 overflow-hidden rounded-xl border border-[#2A2520] bg-[#141414]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.imageUrl}
                alt=""
                className="w-full max-h-[55vh] object-contain"
              />
            </div>
          )}

          <h1 className="font-[family-name:var(--font-playfair)] text-2xl leading-snug mb-6">
            {localized(lang, question.questionCs, question.questionEn)}
          </h1>

          <div className="space-y-3">
            {question.options.map((option, i) => {
              const isSelected = selected === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => choose(i)}
                  disabled={saveState === 'saving'}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors duration-300 ${
                    isSelected
                      ? 'border-[#d8b28c] bg-[#d8b28c] text-[#0A0A0A]'
                      : 'border-[#2A2520] bg-[#141414] text-[#F5F0E8] hover:border-[#d8b28c]/50'
                  }`}
                >
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-[#d8b28c]'
                        : 'border border-[#d8b28c]/40 text-[#d8b28c]'
                    }`}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="text-base leading-snug">{localized(lang, option.cs, option.en)}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="min-h-[3.5rem] mt-5 text-center" aria-live="polite">
            {saveState === 'saving' && <p className="text-sm text-[#B8A99A]">{t.saving}</p>}
            {saveState === 'error' && <p className="text-sm text-red-400">{t.saveError}</p>}
            {saveState !== 'saving' && saveState !== 'error' && selected !== undefined && (
              <>
                <p className="text-sm text-[#7DAE93] font-medium">{t.saved}</p>
                <p className="text-xs text-[#7a6e65] mt-1">{t.savedHint}</p>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-[#2A2520] flex items-center justify-between text-xs">
            <Link href="/kviz" className="text-[#d8b28c] tracking-[0.1em] uppercase">
              {t.backToMap}
            </Link>
            <span className="text-[#B8A99A]">{t.answered(answeredCount, question.total)}</span>
          </div>
        </motion.article>
      )}
    </QuizPage>
  );
}
