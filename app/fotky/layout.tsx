import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Fotky a videa ze svatby — Klára & Michal',
  description: 'Nahrajte své fotky a videa ze svatby a stáhněte si, co nafotili ostatní.',
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
