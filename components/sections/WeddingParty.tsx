'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Member {
  name: string;
  role: string;
  bio: string;
}

export default function WeddingParty() {
  const { t, locale } = useI18n();
  const members = t('weddingParty.members') as unknown as Member[];
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="wedding-party" className="relative pt-0 pb-8 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('weddingParty.title') as string}
          subtitle={t('weddingParty.subtitle') as string}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                {members.map((member, i) => (
                  <motion.div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-[#2A2520] bg-[#1A1A1A] transition-all duration-500 hover:border-[#d8b28c]/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    {/* Photo placeholder */}
                    <div className="relative h-64 bg-gradient-to-br from-[#1F1B17] to-[#1A1A1A] flex items-center justify-center overflow-hidden">
                      <span className="text-5xl opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                        👤
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Info */}
                    <div className="p-6 text-center">
                      <span className="block text-xs tracking-[0.2em] uppercase text-[#d8b28c] mb-2 font-[family-name:var(--font-cormorant)] font-semibold">
                        {member.role}
                      </span>
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#F5F0E8] mb-3 font-light">
                        {member.name}
                      </h3>
                      <p className="text-sm text-[#B8A99A] leading-relaxed">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
