import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Svatební kvíz — Klára & Michal',
  description: 'Jak dobře znáš ženicha s nevěstou? Najdi stanoviště, naskenuj QR a odpověz.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function KvizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
