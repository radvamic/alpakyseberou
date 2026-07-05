'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Swatch {
  name: string;
  hex: string;
  brideOnly?: boolean;
}

function ColorSwatch({ swatch, index, brideOnlyLabel }: { swatch: Swatch; index: number; brideOnlyLabel: string }) {
  const isLight = isLightColor(swatch.hex);

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-lg"
          style={{ backgroundColor: swatch.hex, border: swatch.brideOnly ? '1px solid rgba(255,255,255,0.25)' : undefined }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: swatch.hex }}
          initial={{ boxShadow: `0 0 0px 0px ${swatch.hex}00` }}
          whileHover={{ boxShadow: `0 0 32px 8px ${swatch.hex}55` }}
          transition={{ duration: 0.3 }}
        />
        {/* subtle inner ring */}
        <div
          className="absolute inset-0 rounded-full border border-white/10"
        />
        {/* bride-only diagonal strikethrough */}
        {swatch.brideOnly && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <line x1="15" y1="15" x2="85" y2="85" stroke="#B06F72" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="85" y1="15" x2="15" y2="85" stroke="#B06F72" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </motion.div>

      <div className="text-center">
        <p
          className="font-[family-name:var(--font-cormorant)] text-sm sm:text-base tracking-[0.18em] uppercase text-[#B8A99A]"
          style={swatch.brideOnly ? { textDecoration: 'line-through', textDecorationColor: '#B06F72', textDecorationThickness: '2px' } : undefined}
        >
          {swatch.name}
        </p>
        <p
          className="mt-1 font-[family-name:var(--font-inter)] text-xs tracking-widest uppercase"
          style={{ color: isLight ? '#B8A99A' : swatch.hex }}
        >
          {swatch.hex}
        </p>
        {swatch.brideOnly && (
          <p className="mt-2 font-[family-name:var(--font-cormorant)] text-xs italic text-[#B06F72]/80 max-w-[120px]">
            {brideOnlyLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function WeddingColors() {
  const { t } = useI18n();
  const swatches = t('colors.swatches') as unknown as Swatch[];
  const brideOnlyLabel = t('colors.brideOnlyLabel') as string;

  return (
    <section id="colors" className="relative py-20 sm:py-28 bg-[#141414] overflow-hidden">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, #B8A17E 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <SectionHeader
          title={t('colors.title') as string}
          subtitle={t('colors.subtitle') as string}
        />

        {/* Color swatches */}
        <div className="flex flex-wrap justify-center gap-10 sm:gap-16 mb-14">
          {swatches.map((swatch, i) => (
            <ColorSwatch key={swatch.name} swatch={swatch} index={i} brideOnlyLabel={brideOnlyLabel} />
          ))}
        </div>

        {/* Divider */}
        <motion.div
          className="mx-auto mb-10 h-[1px] bg-gradient-to-r from-transparent via-[#B8A17E]/40 to-transparent"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        />

        {/* Description */}
        <motion.p
          className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl text-[#B8A99A] leading-relaxed max-w-xl mx-auto mb-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t('colors.description') as string}
        </motion.p>

        <motion.p
          className="font-[family-name:var(--font-inter)] text-xs tracking-[0.2em] uppercase text-[#B8A17E]/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {t('colors.dressCodeHint') as string}
        </motion.p>
      </div>
    </section>
  );
}
