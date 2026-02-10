'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Building {
  name: string;
  desc: string;
  icon: string;
}

export default function Accommodation() {
  const { t } = useI18n();
  const buildings = t('accommodation.buildings') as unknown as Building[];
  const transport = t('accommodation.transport') as unknown as {
    title: string;
    car: string;
    public: string;
    note: string;
  };

  return (
    <section id="accommodation" className="relative py-24 md:py-32 bg-[#141414]">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          title={t('accommodation.title') as string}
          subtitle={t('accommodation.subtitle') as string}
        />

        {/* Buildings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {buildings.map((building, i) => (
            <motion.div
              key={i}
              className="group rounded-2xl border border-[#2A2520] bg-[#0A0A0A]/60 p-8 text-center hover:border-[#C9A96E]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                {building.icon}
              </span>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#F5F0E8] mb-3 font-light">
                {building.name}
              </h3>
              <p className="text-sm text-[#B8A99A] leading-relaxed">{building.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Transport */}
        <motion.div
          className="rounded-2xl border border-[#2A2520] bg-[#0A0A0A]/60 p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[#F5F0E8] mb-6 text-center font-light">
            {transport.title}
          </h3>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-[#2A2520] bg-[#141414]">
              <span className="text-2xl flex-shrink-0">🚗</span>
              <p className="text-sm text-[#B8A99A] leading-relaxed">{transport.car}</p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-[#2A2520] bg-[#141414]">
              <span className="text-2xl flex-shrink-0">🚌</span>
              <p className="text-sm text-[#B8A99A] leading-relaxed">{transport.public}</p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-[#C9A96E]/20 bg-[#1E1B18]">
              <span className="text-2xl flex-shrink-0">💡</span>
              <p className="text-sm text-[#E8D5B5] leading-relaxed">{transport.note}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
