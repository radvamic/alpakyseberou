'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

export default function Gifts() {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="gifts" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('gifts.title') as string}
          subtitle={t('gifts.subtitle') as string}
        />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
            {expanded
              ? (locale === 'cs' ? 'Skrýt' : 'Hide')
              : (locale === 'cs' ? 'Zobrazit' : 'Show')}
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
              <div className="text-center pb-8">
                <div className="mb-8">
                  <span className="text-5xl">🎁</span>
                </div>
                <p className="text-base md:text-lg text-[#B8A99A] leading-relaxed mb-10 max-w-2xl mx-auto">
                  {t('gifts.text') as string}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-10 py-4 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
                >
                  {t('gifts.cta') as string}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
