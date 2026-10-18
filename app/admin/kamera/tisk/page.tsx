'use client';

import { useState } from 'react';
import { flushSync } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz';
const DISPLAY_BASE = SITE_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '');
const PATH = '/kamera';

type PrintLayout = 'a5' | 'a4';

// Karta 132 × 194 mm = A5 (148 × 210 mm) s okraji 8 mm.
const BASE_CSS = `
  .a5-card { width: 132mm; height: 194mm; box-sizing: border-box; break-inside: avoid; page-break-inside: avoid; }
  @media print {
    html, body, body > * { background: #fff !important; }
    .no-print { display: none !important; }
    .print-sheet { padding: 0 !important; }
  }
`;

const LAYOUT_CSS: Record<PrintLayout, string> = {
  // Rovnou na papír A5 na výšku.
  a5: `
    @page { size: A5 portrait; margin: 8mm; }
  `,
  // Dvě karty vedle sebe na A4 na šířku; mezera 17 mm leží přesně na středu listu,
  // takže po přestřižení napůl vzniknou dvě A5.
  a4: `
    @page { size: A4 landscape; margin: 8mm; }
    @media print {
      .print-sheet { flex-direction: row !important; flex-wrap: nowrap !important; gap: 17mm !important; }
    }
  `,
};

const PRINT_BUTTON =
  'px-4 py-2 text-sm tracking-[0.08em] uppercase transition-colors';

function KameraCard() {
  return (
    <div className="a5-card relative bg-white border border-dashed border-[#9a948c] flex flex-col items-center justify-between text-center px-[12mm] py-[14mm]">
      <span className="absolute top-[5mm] left-[5mm] w-[6mm] h-[6mm] border-t border-l border-[#b08d67]" />
      <span className="absolute top-[5mm] right-[5mm] w-[6mm] h-[6mm] border-t border-r border-[#b08d67]" />
      <span className="absolute bottom-[5mm] left-[5mm] w-[6mm] h-[6mm] border-b border-l border-[#b08d67]" />
      <span className="absolute bottom-[5mm] right-[5mm] w-[6mm] h-[6mm] border-b border-r border-[#b08d67]" />

      <div>
        <p className="font-[family-name:var(--font-great-vibes)] text-[24pt] text-[#b08d67] leading-none mb-[3mm]">
          Klára &amp; Michal
        </p>
        <p className="text-[9pt] tracking-[0.2em] uppercase text-[#7a6e65]">Fotovýzva · Photo challenge</p>
        <p className="font-[family-name:var(--font-playfair)] text-[26pt] leading-tight mt-[3mm]">
          Jednorázový fotoaparát
        </p>
        <p className="font-[family-name:var(--font-playfair)] text-[15pt] text-[#7a6e65] italic">Disposable camera</p>
      </div>

      <div>
        <p className="font-[family-name:var(--font-cormorant)] text-[14pt] leading-snug">
          Máš 25 fotek. Foť, co chceš — tance, objetí, srandy.
          <br />
          My to pak vyvoláme.
        </p>
        <p className="font-[family-name:var(--font-cormorant)] text-[12pt] leading-snug text-[#7a6e65] italic mt-[1mm]">
          You have 25 shots. Snap away — we&apos;ll develop them later.
        </p>
      </div>

      <div className="flex flex-col items-center gap-[2mm]">
        <QRCodeSVG
          value={`${SITE_BASE}${PATH}`}
          size={320}
          level="M"
          bgColor="#ffffff"
          fgColor="#0A0A0A"
          style={{ width: '72mm', height: '72mm' }}
        />
        <span className="text-[9pt] text-[#7a6e65] tracking-wide">
          {DISPLAY_BASE}
          {PATH}
        </span>
      </div>

      <div>
        <p className="text-[11pt] tracking-[0.18em] uppercase">Naskenuj a foť</p>
        <p className="text-[10pt] tracking-[0.18em] uppercase text-[#7a6e65]">Scan &amp; shoot</p>
      </div>
    </div>
  );
}

/**
 * Stojánek A5 s QR kódem na jednorázový fotoaparát (/kamera) — ve stejném
 * vizuálu jako lístečky kvízu. Tisk přes prohlížeč, případně „Uložit jako PDF“.
 */
export default function KameraTiskPage() {
  const [layout, setLayout] = useState<PrintLayout>('a5');

  // Rozvržení (a s ním @page) se musí propsat do DOM dřív, než se otevře tiskový dialog.
  const printWith = (next: PrintLayout) => {
    flushSync(() => setLayout(next));
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#e9e4dc] text-[#0A0A0A] py-8 print:py-0 print:bg-white">
      <style>{BASE_CSS + LAYOUT_CSS[layout]}</style>

      <div className="no-print max-w-[190mm] mx-auto mb-6 px-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl">QR kód kamery</h1>
          <p className="text-sm text-[#5a5248] max-w-md">
            Karta A5 na stoly. Tiskni rovnou na A5, nebo dvě na A4 na šířku a list přestřihni napůl. V dialogu
            tisku nech měřítko 100 % a počet kopií nastav podle počtu stolů.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/admin" className="text-sm text-[#5a5248] underline underline-offset-2 mr-1">
            ← Administrace
          </a>
          <button
            type="button"
            onClick={() => printWith('a5')}
            className={`${PRINT_BUTTON} bg-[#0A0A0A] text-[#F5F0E8] hover:bg-[#2A2520]`}
          >
            Tisk / PDF — A5
          </button>
          <button
            type="button"
            onClick={() => printWith('a4')}
            className={`${PRINT_BUTTON} border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A]/5`}
          >
            Tisk / PDF — 2× A5 na A4
          </button>
        </div>
      </div>

      <div className="print-sheet flex flex-wrap justify-center gap-6">
        <KameraCard />
        {layout === 'a4' && <KameraCard />}
      </div>
    </div>
  );
}
