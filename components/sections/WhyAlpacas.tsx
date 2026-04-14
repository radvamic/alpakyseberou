'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

/** Small alpaca illustration for the section */
function AlpacaIllustration() {
  return (
    <motion.svg
      viewBox="0 0 80 60"
      className="mx-auto h-24 w-32 text-[#C9A96E]/90"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <path
        d="M25 45 L28 38 L35 35 L42 38 L45 45 L42 50 L35 53 L28 50 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M30 32 L27 26 L30 28 L33 26 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M35 45 L40 40 L55 38" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M55 45 L52 38 L45 35 L38 38 L35 45 L38 50 L45 53 L52 50 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M50 32 L53 26 L50 28 L47 26 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M45 45 L40 40 L25 38" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </motion.svg>
  );
}

export default function WhyAlpacas() {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="alpacas" className="relative pt-0 pb-8 bg-[#0A0A0A] overflow-hidden">
      {/* Very subtle alpaca pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24' width='40' height='24'%3E%3Cpath d='M8 18 L10 14 L14 12 L18 14 L20 18' fill='none' stroke='%23C9A96E' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <SectionHeader
          title={t('alpacas.title') as string}
          subtitle={t('alpacas.subtitle') as string}
        />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
            {expanded
              ? (locale === 'cs' ? 'Skrýt' : 'Hide')
              : (locale === 'cs' ? 'Číst více' : 'Read more')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#C9A96E]"
            >
              ↓
            </motion.span>
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <AlpacaIllustration />
              <motion.p
                className="font-[family-name:var(--font-cormorant)] text-lg text-[#B8A99A] leading-relaxed mt-6 pb-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('alpacas.text') as string}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
