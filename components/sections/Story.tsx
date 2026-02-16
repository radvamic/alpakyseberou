'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Chapter {
  date: string;
  title: string;
  text: string;
}

// Story photos mapped by index (0-based).
// Place your photos in: public/assets/images/story/
// Named: 01.jpg, 02.jpg, ..., 09.jpg
const storyPhotos = [
  '/assets/images/story/01.jpeg',
  '/assets/images/story/02.jpeg',
  '/assets/images/story/03.jpeg',
  '/assets/images/story/04.jpeg',
  '/assets/images/story/05.jpeg',
  '/assets/images/story/06.jpeg',
  '/assets/images/story/07.jpeg',
  '/assets/images/story/08.jpeg',
  '/assets/images/story/09.jpeg',
];

export default function Story() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const chapters = t('story.chapters') as unknown as Chapter[];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Only photos that actually exist (have a src) for lightbox navigation
  const photosWithIndex = storyPhotos
    .map((src, i) => ({ src, i }))
    .filter((p) => p.src);

  const currentLightboxPos = photosWithIndex.findIndex(
    (p) => p.i === lightboxIndex
  );

  const goNext = useCallback(() => {
    if (currentLightboxPos < photosWithIndex.length - 1) {
      setLightboxIndex(photosWithIndex[currentLightboxPos + 1].i);
    }
  }, [currentLightboxPos, photosWithIndex]);

  const goPrev = useCallback(() => {
    if (currentLightboxPos > 0) {
      setLightboxIndex(photosWithIndex[currentLightboxPos - 1].i);
    }
  }, [currentLightboxPos, photosWithIndex]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, goNext, goPrev, closeLightbox]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section id="story" className="relative py-24 md:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Very subtle alpaca pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 24' width='40' height='24'%3E%3Cpath d='M8 18 L10 14 L14 12 L18 14 L20 18' fill='none' stroke='%23C9A96E' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('story.title') as string}
          subtitle={t('story.subtitle') as string}
        />

        <div ref={containerRef} className="relative">
          {/* Animated gold timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-[#2A2520] md:-translate-x-[0.5px]">
            <motion.div
              className="w-full bg-gradient-to-b from-[#C9A96E] to-[#D4AF37]"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Timeline items */}
          <div className="space-y-16 md:space-y-24">
            {chapters.map((chapter, i) => {
              const isLeft = i % 2 === 0;
              const photoSrc = storyPhotos[i];

              return (
                <div
                  key={i}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full border-2 border-[#C9A96E] bg-[#0A0A0A] -translate-x-[5px] md:-translate-x-[6px] mt-2 z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />

                  {/* Content side */}
                  <motion.div
                    className={`ml-12 md:ml-0 md:w-[45%] ${
                      isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                    }`}
                    initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-[#2A2520] bg-[#141414]/80 backdrop-blur-sm hover:border-[#C9A96E]/30 transition-colors duration-500">
                      {/* Photo */}
                      {photoSrc && (
                        <div
                          className="relative h-52 sm:h-60 md:h-72 overflow-hidden cursor-pointer"
                          onClick={() => setLightboxIndex(i)}
                        >
                          <Image
                            src={photoSrc}
                            alt={chapter.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 45vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#141414]/90" />
                          {/* Zoom hint on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-10 h-10 rounded-full bg-black/50 border border-[#C9A96E]/50 flex items-center justify-center backdrop-blur-sm">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text content */}
                      <div className="p-6 md:p-8">
                        {/* Date badge */}
                        <span className="inline-block mb-3 text-xs tracking-[0.2em] uppercase text-[#C9A96E] font-[family-name:var(--font-cormorant)] font-semibold">
                          {chapter.date}
                        </span>

                        <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-[#F5F0E8] mb-3 font-light">
                          {chapter.title}
                        </h3>

                        <p className="text-sm md:text-base leading-relaxed text-[#B8A99A]">
                          {chapter.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && storyPhotos[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeLightbox}
          >
            {/* Photo container */}
            <motion.div
              className="relative w-full max-w-5xl max-h-[85vh] mx-4 aspect-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[85vh] rounded-lg overflow-hidden">
                <Image
                  src={storyPhotos[lightboxIndex]}
                  alt={chapters[lightboxIndex]?.title ?? ''}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <span className="block text-xs tracking-[0.2em] uppercase text-[#C9A96E] font-[family-name:var(--font-cormorant)] font-semibold mb-1">
                  {chapters[lightboxIndex]?.date}
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl text-[#F5F0E8] font-light">
                  {chapters[lightboxIndex]?.title}
                </h3>
              </div>
            </motion.div>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all duration-300"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Previous button */}
            {currentLightboxPos > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all duration-300"
                aria-label="Previous photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Next button */}
            {currentLightboxPos < photosWithIndex.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all duration-300"
                aria-label="Next photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Photo counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] text-[#B8A99A]/60">
              {currentLightboxPos + 1} / {photosWithIndex.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
