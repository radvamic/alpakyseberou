import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Fotky a videa ze svatby — Klára & Michal',
  description: 'Fotky od fotografky, svatební film od kameramana a fotky a videa od hostů — prohlížejte, stahujte, přidávejte své.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function FotkyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
