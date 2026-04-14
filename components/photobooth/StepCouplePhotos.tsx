'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { couplePhotos } from './couplePhotos';

interface StepCouplePhotosProps {
  userPhotoPreview: string;
  selectedPhotos: string[];
  onNext: (photos: string[]) => void;
  onBack: () => void;
}

export default function StepCouplePhotos({
  userPhotoPreview,
  selectedPhotos: initialSelected,
  onNext,
  onBack,
}: StepCouplePhotosProps) {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [wantCouple, setWantCouple] = useState(initialSelected.length > 0);

  const togglePhoto = (src: string) => {
    setSelected((prev) => {
      if (prev.includes(src)) return prev.filter((s) => s !== src);
      if (prev.length >= 2) return prev;
      return [...prev, src];
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* User photo small preview */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#C9A96E]/30 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={userPhotoPreview} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-[#F5F0E8]">
            {t('photobooth.coupleTitle') as string}
          </h3>
          <p className="text-xs text-[#B8A99A]">
            {t('photobooth.coupleDesc') as string}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => { setWantCouple(!wantCouple); if (wantCouple) setSelected([]); }}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-left transition-all duration-300 flex items-center justify-between ${
          wantCouple
            ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
            : 'border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
        }`}
      >
        <span>{t('photobooth.addCouple') as string}</span>
        <motion.div
          className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
            wantCouple ? 'bg-[#C9A96E]' : 'bg-[#2A2520]'
          }`}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white"
            animate={{ x: wantCouple ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.div>
      </button>

      {/* Photo grid */}
      {wantCouple && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-[#B8A99A]/60 mb-3">
            {t('photobooth.coupleMax') as string}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
            {couplePhotos.map((photo) => {
              const isSelected = selected.includes(photo.src);
              return (
                <motion.button
                  key={photo.id}
                  onClick={() => togglePhoto(photo.src)}
                  className={`relative shrink-0 w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                    isSelected
                      ? 'border-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.3)]'
                      : 'border-[#2A2520] hover:border-[#C9A96E]/30'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={locale === 'cs' ? photo.labelCs : photo.labelEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23FDFAF5" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23BE764C" font-size="32">🦙</text></svg>';
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                    <span className="text-[10px] text-white/90">
                      {locale === 'cs' ? photo.labelCs : photo.labelEn}
                    </span>
                  </div>
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C9A96E] flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <svg className="w-3.5 h-3.5 text-[#F5F0E8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[#B8A99A] hover:text-[#C9A96E] transition-colors py-3"
        >
          {t('photobooth.back') as string}
        </button>
        <button
          onClick={() => onNext(wantCouple ? selected : [])}
          className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10"
        >
          {t('photobooth.next') as string}
        </button>
      </div>
    </div>
  );
}
