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
  const { t } = useI18n();
  const questions = t('faq.questions') as unknown as Question[];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 md:py-32 bg-[#0A0A0A]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('faq.title') as string}
          subtitle={t('faq.subtitle') as string}
        />

        <div className="space-y-3">
          {questions.map((item, i) => (
            <motion.div
              key={i}
              className="overflow-hidden rounded-xl border border-[#2A2520] bg-[#141414] hover:border-[#C9A96E]/20 transition-colors duration-500"
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
                  className="text-[#C9A96E] text-xl flex-shrink-0"
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
      </div>
    </section>
  );
}
