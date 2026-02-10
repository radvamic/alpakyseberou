'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Member {
  name: string;
  role: string;
  bio: string;
}

export default function WeddingParty() {
  const { t } = useI18n();
  const members = t('weddingParty.members') as unknown as Member[];

  return (
    <section id="wedding-party" className="relative py-24 md:py-32 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('weddingParty.title') as string}
          subtitle={t('weddingParty.subtitle') as string}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member, i) => (
            <motion.div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[#2A2520] bg-[#141414] transition-all duration-500 hover:border-[#C9A96E]/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Photo placeholder */}
              <div className="relative h-64 bg-gradient-to-br from-[#1E1B18] to-[#141414] flex items-center justify-center overflow-hidden">
                <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                  {i % 2 === 0 ? '👤' : '👤'}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <span className="block text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-2 font-[family-name:var(--font-cormorant)] font-semibold">
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
      </div>
    </section>
  );
}
