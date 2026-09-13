import type { Metadata } from 'next';

// Neveřejná stránka — nesmí se objevit ve vyhledávačích.
export const metadata: Metadata = {
  title: 'Výsledky kvízu — organizátoři',
  robots: { index: false, follow: false },
};

export default function OrganizatoriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
