'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import UploadedPhotosGallery from '@/components/sections/wedding-photos/UploadedPhotosGallery';

export default function WeddingPhotos() {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const steps =
    locale === 'cs'
      ? [
          { step: '1', title: 'Otevřete galerii', desc: 'Zadáte svatební kód a své jméno' },
          { step: '2', title: 'Vyberte fotky a videa', desc: 'Klidně stovky najednou, i dlouhá videa' },
          { step: '3', title: 'Stahujte', desc: 'Prohlédněte si, co nafotili ostatní, a stáhněte si to' },
        ]
      : [
          { step: '1', title: 'Open the gallery', desc: 'Enter the wedding code and your name' },
          { step: '2', title: 'Pick photos & videos', desc: 'Hundreds at once, long videos too' },
          { step: '3', title: 'Download', desc: 'Browse what others captured and download it' },
        ];

  return (
    <section id="wedding-photos" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          title={t('weddingPhotos.title') as string}
          subtitle={t('weddingPhotos.subtitle') as string}
        />

        {/* Expand toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#d8b28c] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
            {expanded
              ? (locale === 'cs' ? 'Skrýt' : 'Hide')
              : (locale === 'cs' ? 'Zobrazit' : 'Show')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#d8b28c]"
            >
              ↓
            </motion.span>
            <span className="h-px w-10 bg-[#d8b28c]/30 group-hover:bg-[#d8b28c]/60 transition-colors duration-300" />
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
              <div className="text-center mb-10">
                <p className="text-base md:text-lg text-[#B8A99A] leading-relaxed max-w-2xl mx-auto mb-8">
                  {t('weddingPhotos.intro') as string}
                </p>
                <a
                  href="/fotky"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d8b28c] px-8 py-4 text-sm tracking-[0.15em] uppercase text-[#0A0A0A] font-medium transition-all duration-500 hover:bg-[#e6c4a2]"
                >
                  📸 {t('weddingPhotos.open') as string}
                </a>
              </div>

              <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 rounded-xl border border-[#2A2520] bg-[#111111] p-5"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#d8b28c]/30 text-xs text-[#d8b28c] font-semibold">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-[#F5F0E8] mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#B8A99A]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <UploadedPhotosGallery locale={locale} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
