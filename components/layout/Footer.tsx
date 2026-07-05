'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16 md:py-24 bg-[#0A0A0A]">
      {/* Top divider */}
      <div className="section-divider mb-16" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Hashtag */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="gold-shimmer font-[family-name:var(--font-playfair)] text-2xl md:text-3xl tracking-wider">
            {t('footer.hashtag') as string}
          </span>
        </motion.div>

        {/* Quote */}
        <motion.p
          className="mb-8 font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[#B8A99A] italic max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('footer.quote') as string}
        </motion.p>

        {/* Monogram */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="font-[family-name:var(--font-great-vibes)] text-3xl text-[#B8A17E]">
            K & M
          </span>
        </motion.div>

        {/* Divider */}
        <div className="mx-auto mb-8 h-[1px] w-32 bg-gradient-to-r from-transparent via-[#B8A17E]/30 to-transparent" />

        {/* Copyright */}
        <p className="text-xs text-[#5a5248] mb-2">
          {t('footer.copyright') as string}
        </p>
        <p className="text-xs text-[#5a5248]">
          {t('footer.madeWith') as string} ❤️
        </p>

        {/* Back to top */}
        <motion.button
          onClick={scrollToTop}
          className="mt-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#B8A17E] transition-colors"
          whileHover={{ y: -2 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-180">
            <path d="M6 2L6 10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1" />
          </svg>
          Back to top
        </motion.button>
      </div>
    </footer>
  );
}
