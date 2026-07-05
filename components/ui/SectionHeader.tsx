'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16 md:mb-20">
      <motion.span
        className="block font-[family-name:var(--font-great-vibes)] text-xl sm:text-2xl text-[#B8A17E] mb-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        {subtitle}
      </motion.span>
      <motion.h2
        className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-[#F5F0E8]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      <motion.div
        className="mx-auto mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#B8A17E] to-transparent"
        initial={{ width: 0 }}
        whileInView={{ width: 120 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </div>
  );
}
