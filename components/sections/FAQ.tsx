'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Question {
  q: string;
  a: string;
}

export default function FAQ() {
  const { t, locale } = useI18n();
  const questions = t('faq.questions') as unknown as Question[];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="faq" className="relative pt-0 pb-8 bg-[#0A0A0A]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('faq.title') as string}
          subtitle={t('faq.subtitle') as string}
        />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#B8A17E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#B8A17E]/30 group-hover:bg-[#B8A17E]/60 transition-colors duration-300" />
            {expanded ? (locale === 'cs' ? 'Skrýt' : 'Hide') : (locale === 'cs' ? 'Zobrazit' : 'Show')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#B8A17E]"
            >↓</motion.span>
            <span className="h-px w-10 bg-[#B8A17E]/30 group-hover:bg-[#B8A17E]/60 transition-colors duration-300" />
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
        <div className="space-y-3 pb-8">
          {questions.map((item, i) => (
            <motion.div
              key={i}
              className="overflow-hidden rounded-xl border border-[#2A2520] bg-[#111111] hover:border-[#B8A17E]/20 transition-colors duration-500"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-[family-name:var(--font-cormorant)] text-base md:text-lg text-[#F5F0E8] font-semibold pr-4">
                  {item.q}
                </span>
                <motion.span
                  className="text-[#B8A17E] text-xl flex-shrink-0"
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    <div className="px-6 pb-6">
                      <div className="h-[1px] bg-[#2A2520] mb-4" />
                      <p className="text-sm text-[#B8A99A] leading-relaxed">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
