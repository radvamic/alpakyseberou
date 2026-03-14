'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { categories, type MotifCategory } from './motifs';

interface StepCategoryProps {
  onSelect: (category: MotifCategory) => void;
  onBack: () => void;
}

export default function StepCategory({ onSelect, onBack }: StepCategoryProps) {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl text-[#F5F0E8]">
          {t('photobooth.categoryTitle') as string}
        </h3>
        <p className="text-xs text-[#B8A99A] mt-1">
          {t('photobooth.categoryDesc') as string}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="w-full rounded-xl border border-[#2A2520] bg-[#141414] p-4 sm:p-5 text-left transition-all duration-300 hover:border-[#C9A96E]/40 hover:bg-[#C9A96E]/5 group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl sm:text-4xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors">
                  {locale === 'cs' ? cat.nameCs : cat.nameEn}
                </h4>
                <p className="text-xs text-[#B8A99A] mt-0.5">
                  {locale === 'cs' ? cat.descCs : cat.descEn}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#2A2520] group-hover:text-[#C9A96E] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onBack}
          className="text-sm text-[#B8A99A] hover:text-[#C9A96E] transition-colors py-3"
        >
          {t('photobooth.back') as string}
        </button>
      </div>
    </div>
  );
}
