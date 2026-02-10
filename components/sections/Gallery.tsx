'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

const galleryPlaceholders = [
  { h: 'h-64', span: '' },
  { h: 'h-80', span: 'sm:row-span-2' },
  { h: 'h-56', span: '' },
  { h: 'h-72', span: '' },
  { h: 'h-64', span: '' },
  { h: 'h-80', span: 'sm:row-span-2' },
  { h: 'h-56', span: '' },
  { h: 'h-72', span: '' },
  { h: 'h-64', span: '' },
];

export default function Gallery() {
  const { t } = useI18n();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-[#141414]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('gallery.title') as string}
          subtitle={t('gallery.subtitle') as string}
        />

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryPlaceholders.map((item, i) => (
            <motion.div
              key={i}
              className={`group relative break-inside-avoid overflow-hidden rounded-xl border border-[#2A2520] bg-[#0A0A0A] ${item.h} cursor-pointer hover:border-[#C9A96E]/30 transition-all duration-500`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              onClick={() => setLightboxIndex(i)}
            >
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                  📷
                </span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#C9A96E]/0 group-hover:bg-[#C9A96E]/5 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[80vh] rounded-xl border border-[#2A2520] bg-[#141414] p-12 flex items-center justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-6xl opacity-30">📷</span>
              <p className="absolute bottom-4 text-xs text-[#B8A99A]">Photo {(lightboxIndex ?? 0) + 1}</p>
            </motion.div>

            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-[#B8A99A] hover:text-[#C9A96E] transition-colors text-2xl"
            >
              ×
            </button>

            {/* Navigation */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 text-[#B8A99A] hover:text-[#C9A96E] transition-colors text-3xl"
              >
                ‹
              </button>
            )}
            {lightboxIndex < galleryPlaceholders.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 text-[#B8A99A] hover:text-[#C9A96E] transition-colors text-3xl"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
