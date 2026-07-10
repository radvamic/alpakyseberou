'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function PhotoBoothTeaser() {
  const { t } = useI18n();

  return (
    <section className="relative py-20 md:py-28 bg-[#0A0A0A] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d8b28c]/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6 text-center relative z-10">
        {/* Animated alpaca icon */}
        <motion.div
          className="text-5xl sm:text-6xl mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ rotate: [0, -5, 5, 0] }}
        >
          🦙✨
        </motion.div>

        <motion.span
          className="block font-[family-name:var(--font-great-vibes)] text-xl sm:text-2xl text-[#d8b28c] mb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('photobooth.teaserSubtitle') as string}
        </motion.span>

        <motion.h2
          className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-[#F5F0E8] mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {t('photobooth.teaserTitle') as string}
        </motion.h2>

        <motion.p
          className="text-[#B8A99A] max-w-lg mx-auto mb-10 text-sm sm:text-base leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('photobooth.teaserText') as string}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/fotokoutek"
            className="inline-flex items-center gap-3 rounded-full border border-[#d8b28c] bg-[#d8b28c]/10 px-8 py-4 text-sm tracking-[0.15em] uppercase text-[#d8b28c] transition-all duration-500 hover:bg-[#d8b28c]/20 hover:shadow-[0_0_30px_rgba(201,169,110,0.15)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            {t('photobooth.teaserCta') as string}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
