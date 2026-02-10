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
  title: "Michal & Klára — 29. 8. 2026",
  description: "Svatební web Michala a Kláry. 29. srpna 2026 v Mlýně Davídkov.",
  openGraph: {
    title: "Michal & Klára — Svatba 2026",
    description: "Pojďte oslavit naši lásku s námi. 29. srpna 2026, Mlýn Davídkov.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💍</text></svg>"
        />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
