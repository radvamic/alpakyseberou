import type { NextConfig } from "next";
import { QUIZ_CLOSED } from "./lib/quiz-types";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    if (!QUIZ_CLOSED) return [];
    // Stránky pro hosty (QR kódy na stanovištích) → výsledky na úvodní stránce.
    // Stránky organizátorů (/kviz/organizatori/…) zůstávají.
    return ["/kviz", "/kviz/:number(\\d+)", "/kviz/vysledky"].map((source) => ({
      source,
      destination: "/#quiz",
      permanent: false,
    }));
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
