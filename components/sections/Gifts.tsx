'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

export default function Gifts() {
  const { t } = useI18n();
  const paragraphs = t('gifts.paragraphs') as string[];

  return (
    <section id="gifts" className="relative scroll-mt-24 pt-0 pb-8 bg-[#141414] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('gifts.title') as string}
          subtitle={t('gifts.subtitle') as string}
        />

        <motion.div
          className="relative mb-8 rounded-[2rem] border border-[#2A2520] bg-[#0F0F0F]/85 p-8 text-center shadow-2xl shadow-black/20 sm:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <div className="mx-auto mb-8 flex w-fit items-center gap-3 font-[family-name:var(--font-cormorant)] text-xs tracking-[0.24em] uppercase text-[#C9A96E]/80">
            <span className="h-px w-8 bg-[#C9A96E]/40" />
            {t('gifts.kicker') as string}
            <span className="h-px w-8 bg-[#C9A96E]/40" />
          </div>

          <div className="mx-auto max-w-2xl space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[#B8A99A] sm:text-xl"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mx-auto my-8 h-[1px] max-w-xs bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent" />

          <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.2em] text-[#C9A96E]/70">
            {t('gifts.note') as string}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
