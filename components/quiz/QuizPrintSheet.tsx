'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { QUIZ_ORGANIZER_HEADER, type QuizAdminData, type QuizAdminQuestion } from '@/lib/quiz-types';

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz';
const DISPLAY_BASE = SITE_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '');

type PrintLayout = 'one' | 'two';

const BASE_CSS = `
  .print-card { width: 190mm; height: 136mm; box-sizing: border-box; break-inside: avoid; page-break-inside: avoid; }
  @media print {
    html, body, body > * { background: #fff !important; }
    .no-print { display: none !important; }
    .print-sheet { padding: 0 !important; }
  }
`;

const LAYOUT_CSS: Record<PrintLayout, string> = {
  // A4 na šířku, okraje 10 mm → 277 × 190 mm; karta 190 × 136 mm zvětšená 1,38× ≈ 262 × 188 mm.
  one: `
    @page { size: A4 landscape; margin: 10mm; }
    @media print {
      .print-sheet { gap: 0 !important; }
      .print-card { zoom: 1.38; break-after: page; page-break-after: always; }
      .print-card:last-child { break-after: auto; page-break-after: auto; }
    }
  `,
  // A4 na výšku, okraje 10 mm → 277 mm výšky = dvě karty po 136 mm + mezera.
  two: `
    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      .print-sheet { gap: 5mm !important; }
    }
  `,
};

const PRINT_BUTTON =
  'px-4 py-2 text-sm tracking-[0.08em] uppercase disabled:opacity-40 transition-colors';

function CardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-card relative mx-auto bg-white border border-dashed border-[#9a948c] flex items-center gap-[8mm] px-[12mm]">
      <span className="absolute top-[5mm] left-[5mm] w-[6mm] h-[6mm] border-t border-l border-[#b08d67]" />
      <span className="absolute top-[5mm] right-[5mm] w-[6mm] h-[6mm] border-t border-r border-[#b08d67]" />
      <span className="absolute bottom-[5mm] left-[5mm] w-[6mm] h-[6mm] border-b border-l border-[#b08d67]" />
      <span className="absolute bottom-[5mm] right-[5mm] w-[6mm] h-[6mm] border-b border-r border-[#b08d67]" />
      {children}
    </div>
  );
}

function Qr({ path }: { path: string }) {
  return (
    <div className="shrink-0 flex flex-col items-center gap-[2mm]">
      <QRCodeSVG
        value={`${SITE_BASE}${path}`}
        size={320}
        level="M"
        bgColor="#ffffff"
        fgColor="#0A0A0A"
        style={{ width: '80mm', height: '80mm' }}
      />
      <span className="text-[9pt] text-[#7a6e65] tracking-wide">
        {DISPLAY_BASE}
        {path}
      </span>
    </div>
  );
}

function StartCard() {
  return (
    <CardFrame>
      <div className="flex-1 min-w-0">
        <p className="font-[family-name:var(--font-great-vibes)] text-[26pt] text-[#b08d67] leading-none mb-[4mm]">
          Klára &amp; Michal
        </p>
        <p className="font-[family-name:var(--font-playfair)] text-[30pt] leading-tight">Svatební kvíz</p>
        <p className="font-[family-name:var(--font-playfair)] text-[16pt] text-[#7a6e65] italic mb-[6mm]">
          Wedding quiz
        </p>
        <p className="font-[family-name:var(--font-cormorant)] text-[15pt] leading-snug">
          Jak dobře znáš ženicha s nevěstou?
        </p>
        <p className="font-[family-name:var(--font-cormorant)] text-[13pt] leading-snug text-[#7a6e65] italic mb-[6mm]">
          How well do you know the bride and groom?
        </p>
        <p className="text-[11pt] tracking-[0.18em] uppercase">Naskenuj a začni</p>
        <p className="text-[10pt] tracking-[0.18em] uppercase text-[#7a6e65]">Scan to start</p>
      </div>
      <Qr path="/kviz" />
    </CardFrame>
  );
}

function QuestionCard({ question }: { question: QuizAdminQuestion }) {
  return (
    <CardFrame>
      <div className="flex-1 min-w-0">
        <p className="font-[family-name:var(--font-great-vibes)] text-[20pt] text-[#b08d67] leading-none mb-[2mm]">
          Klára &amp; Michal
        </p>
        <p className="text-[10pt] tracking-[0.2em] uppercase text-[#7a6e65]">Svatební kvíz · Wedding quiz</p>
        <p className="text-[12pt] tracking-[0.2em] uppercase mt-[6mm]">Otázka · Question</p>
        <p className="font-[family-name:var(--font-playfair)] lining-nums text-[110pt] leading-[0.9] text-[#0A0A0A]">
          {question.number}
        </p>
        <p className="text-[11pt] tracking-[0.18em] uppercase mt-[6mm]">Naskenuj a odpověz</p>
        <p className="text-[10pt] tracking-[0.18em] uppercase text-[#7a6e65]">Scan &amp; answer</p>
      </div>
      <Qr path={`/kviz/${question.number}`} />
    </CardFrame>
  );
}

/**
 * Lístečky s QR kódy pro stánek a stanoviště — souhrnně, nebo jen jeden
 * (?only=<číslo>). Tisk přes prohlížeč, případně „Uložit jako PDF“.
 * Používá admin (cookie) i stránka organizátorů (klíč v hlavičce).
 */
export default function QuizPrintSheet({
  organizerKey,
  backHref,
  backLabel,
}: {
  organizerKey?: string;
  backHref: string;
  backLabel: string;
}) {
  const [questions, setQuestions] = useState<QuizAdminQuestion[] | null>(null);
  const [only, setOnly] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [layout, setLayout] = useState<PrintLayout>('two');

  // Rozvržení (a s ním @page) se musí propsat do DOM dřív, než se otevře tiskový dialog.
  const printWith = (next: PrintLayout) => {
    flushSync(() => setLayout(next));
    window.print();
  };

  useEffect(() => {
    const onlyParam = Number(new URLSearchParams(window.location.search).get('only'));
    fetch('/api/admin/quiz', { headers: organizerKey ? { [QUIZ_ORGANIZER_HEADER]: organizerKey } : {} })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Load failed'))))
      .then((data: QuizAdminData) => {
        setOnly(Number.isInteger(onlyParam) && onlyParam > 0 ? onlyParam : null);
        setQuestions(data.questions);
      })
      .catch(() => setError(true));
  }, [organizerKey]);

  const showAll = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setOnly(null);
  };

  const cards = only ? questions?.filter((q) => q.number === only) : questions;

  return (
    <div className="min-h-screen bg-[#e9e4dc] text-[#0A0A0A] py-8 print:py-0">
      <style>{BASE_CSS + LAYOUT_CSS[layout]}</style>

      <div className="no-print max-w-[190mm] mx-auto mb-6 px-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl">
            {only ? `QR kód otázky ${only}` : 'QR kódy kvízu'}
          </h1>
          <p className="text-sm text-[#5a5248] max-w-md">
            {only ? (
              <>
                Jeden lísteček.{' '}
                <button type="button" onClick={showAll} className="underline underline-offset-2">
                  Zobrazit všechny QR kódy
                </button>
                .
              </>
            ) : (
              'Start na stánek a lísteček pro každé stanoviště.'
            )}{' '}
            Jedna otázka na stránku A4 na šířku, nebo dvě na výšku (rozstříhej podle čárkované čáry). V dialogu
            tisku nech měřítko 100 %.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href={backHref} className="text-sm text-[#5a5248] underline underline-offset-2 mr-1">
            {backLabel}
          </a>
          <button
            type="button"
            onClick={() => printWith('one')}
            disabled={!cards?.length}
            className={`${PRINT_BUTTON} bg-[#0A0A0A] text-[#F5F0E8] hover:bg-[#2A2520]`}
          >
            Tisk / PDF — 1 na stránku (na šířku)
          </button>
          <button
            type="button"
            onClick={() => printWith('two')}
            disabled={!cards?.length}
            className={`${PRINT_BUTTON} border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5`}
          >
            Tisk / PDF — 2 na stránku (na výšku)
          </button>
        </div>
      </div>

      {error && <p className="no-print text-center text-red-700">Nepodařilo se načíst otázky.</p>}
      {!questions && !error && <p className="no-print text-center text-[#5a5248]">Načítám…</p>}
      {only && questions && cards?.length === 0 && (
        <p className="no-print text-center text-[#5a5248]">Otázka {only} neexistuje.</p>
      )}

      {cards && (
        <div className="print-sheet flex flex-col items-center gap-6">
          {!only && <StartCard />}
          {cards.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
