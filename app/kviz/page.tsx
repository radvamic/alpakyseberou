'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GuestIdentityForm from '@/components/guest/GuestIdentityForm';
import { QuizHeader, QuizPage, QuizSpinner } from '@/components/quiz/QuizUi';
import { useQuizLang, useQuizPlayer } from '@/hooks/useQuizPlayer';
import { formatGuestName } from '@/lib/guest-identity';
import { QUIZ_T } from '@/lib/quiz-i18n';
import type { QuizQuestionSummary } from '@/lib/quiz-types';

const MAPY_URL = 'https://mapy.com/s/fabubofadu';

const MAP_IMAGES = {
  map: '/assets/images/kviz/mapa.png',
  satellite: '/assets/images/kviz/mapa-satelit.jpg',
} as const;

type MapView = keyof typeof MAP_IMAGES;

/** Start u stánku: přihlášení, mapa stanovišť a postup hosta. */
export default function KvizStartPage() {
  const { lang, toggleLang } = useQuizLang();
  const t = QUIZ_T[lang];
  const { status, player, registering, register, logout } = useQuizPlayer();
  const [questions, setQuestions] = useState<QuizQuestionSummary[]>([]);
  const [mapView, setMapView] = useState<MapView>('map');

  useEffect(() => {
    fetch('/api/quiz/questions')
      .then((res) => (res.ok ? res.json() : []))
      .then(setQuestions)
      .catch(() => {});
  }, []);

  const answeredCount = player
    ? questions.filter((q) => player.answers[q.id] !== undefined).length
    : 0;
  const allDone = questions.length > 0 && answeredCount === questions.length;

  return (
    <QuizPage>
      <QuizHeader t={t} onToggleLang={toggleLang} />

      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light leading-tight mb-6">
        {t.title}
      </h1>

      {status === 'loading' && <QuizSpinner />}

      {status === 'anonymous' && (
        <section className="text-center">
          <p className="text-[#B8A99A] text-sm mb-6 leading-relaxed">{t.identityIntro}</p>
          <GuestIdentityForm texts={t.form} onSubmit={register} loading={registering} />
        </section>
      )}

      {status === 'ready' && player && (
        <div className="space-y-10">
          <section>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#d8b28c] mb-2">
              {t.hello(player.firstName)}
            </p>
            <p className="text-sm text-[#B8A99A] leading-relaxed">{t.howTo}</p>
          </section>

          <section>
            <div className="flex gap-2 mb-3">
              {(Object.keys(MAP_IMAGES) as MapView[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMapView(view)}
                  className={`flex-1 py-2 rounded-full text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                    mapView === view
                      ? 'bg-[#d8b28c] text-[#0A0A0A] font-semibold'
                      : 'border border-[#2A2520] text-[#B8A99A] hover:border-[#d8b28c]/40 hover:text-[#d8b28c]'
                  }`}
                >
                  {view === 'map' ? t.map : t.satellite}
                </button>
              ))}
            </div>
            {/* Klepnutím se mapa otevře v plné velikosti — na telefonu jde přiblížit. */}
            <a
              href={MAP_IMAGES[mapView]}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-[#2A2520] bg-[#141414]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={MAP_IMAGES[mapView]} alt={t.map} className="w-full h-auto" />
            </a>
            <a
              href={MAPY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-xs tracking-[0.15em] uppercase text-[#d8b28c] underline underline-offset-4"
            >
              {t.openMapy} ↗
            </a>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xs tracking-[0.2em] uppercase text-[#d8b28c]">{t.progressTitle}</h2>
              <span className="text-xs text-[#B8A99A]">
                {t.answered(answeredCount, questions.length)}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q) =>
                player.answers[q.id] !== undefined ? (
                  <Link
                    key={q.id}
                    href={`/kviz/${q.number}`}
                    className="aspect-square rounded-lg bg-[#d8b28c] text-[#0A0A0A] font-[family-name:var(--font-playfair)] text-xl flex items-center justify-center active:scale-95 transition-transform"
                  >
                    {q.number}
                  </Link>
                ) : (
                  <div
                    key={q.id}
                    className="aspect-square rounded-lg border border-[#2A2520] text-[#4A4540] font-[family-name:var(--font-playfair)] text-xl flex items-center justify-center"
                  >
                    {q.number}
                  </div>
                ),
              )}
            </div>
            <p className="mt-3 text-xs text-[#7a6e65] leading-relaxed">
              {allDone ? t.allDone : t.progressHint}
            </p>
          </section>

          <Link
            href="/kviz/vysledky"
            className="block w-full rounded-full border border-[#d8b28c] py-3.5 text-center text-sm tracking-[0.18em] uppercase text-[#d8b28c] hover:bg-[#d8b28c]/10 transition-colors"
          >
            {t.showResults}
          </Link>

          <p className="text-center text-xs text-[#5a5248]">
            {t.notYou(formatGuestName(player.firstName, player.lastName))}{' '}
            <button
              type="button"
              onClick={logout}
              className="text-[#d8b28c] underline underline-offset-2"
            >
              {t.switchPlayer}
            </button>
          </p>
        </div>
      )}
    </QuizPage>
  );
}
