'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import { galleryImages } from '@/data/galleryImages';

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
  const { t, locale } = useI18n();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const hasImages = galleryImages.length > 0;
  const count = hasImages ? galleryImages.length : galleryPlaceholders.length;

  return (
    <section id="gallery" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('gallery.title') as string}
          subtitle={t('gallery.subtitle') as string}
        />

        {/* Expand toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#B8A17E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#B8A17E]/30 group-hover:bg-[#B8A17E]/60 transition-colors duration-300" />
            {expanded
              ? (locale === 'cs' ? 'Skrýt' : 'Hide')
              : (locale === 'cs' ? 'Zobrazit galerii' : 'Show gallery')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#B8A17E]"
            >
              ↓
            </motion.span>
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
              {/* Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 pb-8">
                {hasImages
                  ? galleryImages.map((img, i) => {
                      const layout = galleryPlaceholders[i % galleryPlaceholders.length];
                      return (
                        <motion.div
                          key={img.thumb}
                          className={`group relative break-inside-avoid overflow-hidden rounded-xl border border-[#2A2520] bg-[#1A1A1A] w-full ${layout.h} cursor-pointer hover:border-[#B8A17E]/30 transition-all duration-500`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                          onClick={() => setLightboxIndex(i)}
                        >
                          <Image
                            src={img.thumb}
                            alt=""
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-[#B8A17E]/0 group-hover:bg-[#B8A17E]/5 transition-colors duration-500" />
                        </motion.div>
                      );
                    })
                  : galleryPlaceholders.map((item, i) => (
                      <motion.div
                        key={i}
                        className={`group relative break-inside-avoid overflow-hidden rounded-xl border border-[#2A2520] bg-[#1A1A1A] ${item.h} cursor-pointer hover:border-[#B8A17E]/30 transition-all duration-500`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                            📷
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-[#B8A17E]/0 group-hover:bg-[#B8A17E]/5 transition-colors duration-500" />
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[80vh] rounded-xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {hasImages ? (
                <Image
                  src={galleryImages[lightboxIndex].full}
                  alt=""
                  width={1200}
                  height={900}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                />
              ) : (
                <div className="rounded-xl border border-[#2A2520] bg-[#141414] p-12 flex items-center justify-center min-h-[200px]">
                  <span className="text-6xl opacity-30">📷</span>
                </div>
              )}
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-[#B8A99A]/60">
                {lightboxIndex + 1} / {hasImages ? galleryImages.length : galleryPlaceholders.length}
              </p>
            </motion.div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#B8A17E] hover:border-[#B8A17E]/50 transition-all duration-300 text-xl"
            >
              ×
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#B8A17E] hover:border-[#B8A17E]/50 transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {lightboxIndex < (hasImages ? galleryImages.length : galleryPlaceholders.length) - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#B8A17E] hover:border-[#B8A17E]/50 transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
