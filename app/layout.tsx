import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alpakyseberou.cz"),
  title: "Klára & Michal — 26. 9. 2026",
  description: "Děkujeme, že jste to s námi oslavili! Fotky a videa ze svatby najdete tady.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Klára & Michal — Děkujeme! 🤍",
    description: "Děkujeme, že jste to s námi oslavili! Fotky a videa ze svatby najdete tady.",
    locale: "cs_CZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head />
      <body
        className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
