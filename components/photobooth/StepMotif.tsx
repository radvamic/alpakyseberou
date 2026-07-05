'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { getMotifsByCategory, type MotifCategory } from './motifs';

interface StepMotifProps {
  category: MotifCategory;
  onSelect: (motifId: string) => void;
  onBack: () => void;
}

export default function StepMotif({ category, onSelect, onBack }: StepMotifProps) {
  const { t, locale } = useI18n();
  const motifs = getMotifsByCategory(category);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl text-[#F5F0E8]">
          {t('photobooth.motifTitle') as string}
        </h3>
        <p className="text-xs text-[#B8A99A] mt-1">
          {t('photobooth.motifDesc') as string}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {motifs.map((motif, i) => (
          <motion.button
            key={motif.id}
            onClick={() => onSelect(motif.id)}
            className="rounded-xl border border-[#2A2520] bg-[#1A1A1A] p-3 sm:p-4 text-center transition-all duration-300 hover:border-[#B8A17E]/40 hover:bg-[#B8A17E]/5 group min-h-[100px] flex flex-col items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl sm:text-3xl">{motif.emoji}</span>
            <h4 className="font-[family-name:var(--font-cormorant)] text-sm sm:text-base text-[#F5F0E8] group-hover:text-[#B8A17E] transition-colors leading-tight">
              {locale === 'cs' ? motif.nameCs : motif.nameEn}
            </h4>
            <p className="text-[10px] sm:text-xs text-[#B8A99A]/60 leading-tight">
              {locale === 'cs' ? motif.descCs : motif.descEn}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[#B8A99A] hover:text-[#B8A17E] transition-colors py-3"
        >
          {t('photobooth.back') as string}
        </button>
      </div>
    </div>
  );
}
