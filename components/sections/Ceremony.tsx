'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [openDay, setOpenDay] = useState<number | null>(null);

  const handleAddToCalendar = () => {
    const url =
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Svatba+Michal+%26+Kl%C3%A1ra&dates=20260925T120000Z/20260927T000000Z&location=Statek+V%C5%A1etice%2C+V%C5%A1etice+6%2C+257+44+Netvo%C5%99ice&details=Svatebn%C3%AD+v%C3%ADkend+Michala+a+Kl%C3%A1ry';
    window.open(url, '_blank');
  };

  const toggle = (i: number) => setOpenDay(openDay === i ? null : i);

  return (
    <section id="ceremony" className="relative pt-4 pb-24 md:pt-6 md:pb-32 bg-[#141414]">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          title={t('ceremony.title') as string}
          subtitle={t('ceremony.subtitle') as string}
        />

        <div className="space-y-3">
          {days.map((day, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
            >
              {/* Day header — clickable */}
              <button
                onClick={() => toggle(dayIndex)}
                className="w-full flex items-center justify-between gap-4 border border-[#2A2520] bg-[#0A0A0A]/60 px-6 py-5 hover:border-[#C9A96E]/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="font-[family-name:var(--font-cormorant)] text-xs tracking-[0.2em] uppercase text-[#C9A96E]">
                    {day.label}
                  </span>
                  <span className="hidden sm:block h-px w-6 bg-[#2A2520] group-hover:bg-[#C9A96E]/30 transition-colors" />
                  <span className="font-[family-name:var(--font-playfair)] text-lg md:text-xl text-[#F5F0E8] font-light">
                    {day.subtitle}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: openDay === dayIndex ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#C9A96E] text-sm flex-shrink-0"
                >
                  ↓
                </motion.span>
              </button>

              {/* Collapsible schedule */}
              <AnimatePresence initial={false}>
                {openDay === dayIndex && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="border border-t-0 border-[#2A2520] px-6 pt-8 pb-6">
                      {/* Dress code */}
                      {dayIndex === 0 && (
                        <p className="text-center text-xs tracking-[0.15em] uppercase text-[#B8A99A] mb-8">
                          {t('ceremony.dressCodeFriday') as string}
                        </p>
                      )}
                      {dayIndex === 1 && (
                        <p className="text-center text-xs tracking-[0.15em] uppercase text-[#B8A99A] mb-8">
                          {t('ceremony.dressCode') as string}
                        </p>
                      )}

                      {/* Timeline */}
                      <div className="relative">
                        <div className="absolute left-[22px] top-0 bottom-0 w-[1px] bg-[#2A2520]" />
                        <div className="space-y-5">
                          {day.schedule.map((item, i) => (
                            <div
                              key={i}
                              className="relative flex items-start gap-5 pl-2"
                            >
                              <div className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#C9A96E]/30 bg-[#141414] text-lg">
                                {item.icon}
                              </div>
                              <div className="flex-1 py-1">
                                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                                  <span className="font-[family-name:var(--font-playfair)] text-base text-[#C9A96E] font-medium whitespace-nowrap">
                                    {item.time}
                                  </span>
                                  <span className="font-[family-name:var(--font-cormorant)] text-lg text-[#F5F0E8] font-semibold">
                                    {item.event}
                                  </span>
                                </div>
                                <p className="text-sm text-[#B8A99A]">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Calendar button */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={handleAddToCalendar}
            className="rounded-full border border-[#C9A96E]/30 bg-transparent px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
          >
            {t('ceremony.addToCalendar') as string}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
