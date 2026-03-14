'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface ScheduleItem {
  time: string;
  event: string;
  icon: string;
  desc: string;
}

interface DaySchedule {
  label: string;
  subtitle: string;
  schedule: ScheduleItem[];
}

export default function Ceremony() {
  const { t } = useI18n();
  const days = t('ceremony.days') as unknown as DaySchedule[];

  const handleAddToCalendar = () => {
    const url =
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Svatba+Michal+%26+Kl%C3%A1ra&dates=20260925T120000Z/20260927T000000Z&location=Hotel+V%C5%A1etice%2C+V%C5%A1etice+6%2C+257+44+Netvo%C5%99ice&details=Svatebn%C3%AD+v%C3%ADkend+Michala+a+Kl%C3%A1ry';
    window.open(url, '_blank');
  };

  return (
    <section id="ceremony" className="relative py-24 md:py-32 bg-[#141414]">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          title={t('ceremony.title') as string}
          subtitle={t('ceremony.subtitle') as string}
        />

        {/* Two-day schedule */}
        <div className="space-y-20">
          {days.map((day, dayIndex) => (
            <div key={dayIndex}>
              {/* Day header */}
              <motion.div
                className="mb-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-6 py-2 text-xs tracking-[0.2em] uppercase text-[#C9A96E] font-[family-name:var(--font-cormorant)] font-semibold">
                  {day.label}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light">
                  {day.subtitle}
                </h3>

                {/* Dress code for each day */}
                {dayIndex === 0 && (
                  <p className="mt-3 text-sm text-[#B8A99A]">
                    {t('ceremony.dressCodeFriday') as string}
                  </p>
                )}
                {dayIndex === 1 && (
                  <p className="mt-3 text-sm text-[#B8A99A]">
                    {t('ceremony.dressCode') as string}
                  </p>
                )}
              </motion.div>

              {/* Schedule Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[22px] top-0 bottom-0 w-[1px] bg-[#2A2520]" />

                <div className="space-y-6">
                  {day.schedule.map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative flex items-start gap-6 pl-2"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    >
                      {/* Icon dot */}
                      <div className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#C9A96E]/30 bg-[#1E1B18] text-lg">
                        {item.icon}
                      </div>

                      {/* Content card */}
                      <div className="flex-1 rounded-xl border border-[#2A2520] bg-[#0A0A0A]/60 p-5 hover:border-[#C9A96E]/20 transition-colors duration-500">
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="font-[family-name:var(--font-playfair)] text-lg text-[#C9A96E] font-medium whitespace-nowrap">
                            {item.time}
                          </span>
                          <h3 className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[#F5F0E8] font-semibold">
                            {item.event}
                          </h3>
                        </div>
                        <p className="text-sm text-[#B8A99A]">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar button */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={handleAddToCalendar}
            className="group relative overflow-hidden rounded-full border border-[#C9A96E]/30 bg-transparent px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
          >
            <span className="relative z-10">{t('ceremony.addToCalendar') as string}</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
