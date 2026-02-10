'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

export default function Gifts() {
  const { t } = useI18n();

  return (
    <section id="gifts" className="relative py-24 md:py-32 bg-[#141414]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('gifts.title') as string}
          subtitle={t('gifts.subtitle') as string}
        />

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
