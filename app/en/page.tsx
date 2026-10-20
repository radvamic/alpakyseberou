import type { Metadata } from 'next';
import EnglishRedirect from './EnglishRedirect';

// Odkaz pro anglicky mluvící hosty: náhled ve zprávě je anglicky a web se pak otevře v angličtině
export const metadata: Metadata = {
  title: 'Klára & Michal — Thank you!',
  description: 'Thank you for celebrating with us! The wedding photos and videos are here.',
  openGraph: {
    title: 'Klára & Michal — Thank you! 🤍',
    description: 'Thank you for celebrating with us! The wedding photos and videos are here.',
    locale: 'en_GB',
    // Vlastní openGraph přepíše zděděný, fotku z app/opengraph-image.jpg je tak potřeba uvést znovu
    images: [{ url: '/opengraph-image.jpg', width: 1200, height: 630, alt: 'Klára and Michal on the jetty by the pond' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function EnglishPage() {
  return <EnglishRedirect />;
}
