'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface AccommodationBuilding {
  name: string;
  subtitle: string;
  desc: string;
  rooms: string;
  image: string;
  url: string;
}

const accommodationBuildings: { cs: AccommodationBuilding[]; en: AccommodationBuilding[] } = {
  cs: [
    {
      name: 'Exclusive',
      subtitle: 'Tematická apartmá',
      desc: 'Osobitě zařízená apartmá, každé s vlastním příběhem. Od orientálního pokoje s vířivou vanou po romantické apartmá s nebesy.',
      rooms: '8 apartmá',
      image: '/assets/images/venue/room-exclusive.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Komfort',
      subtitle: 'Prostorné pokoje',
      desc: 'Komfortní pokoje ve třech hotelových křídlech, ideální pro pohodlný odpočinek po svatebním veselí.',
      rooms: '26 pokojů',
      image: '/assets/images/venue/room-komfort.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Klasik',
      subtitle: 'Venkovský šarm',
      desc: 'Útulné pokoje s atmosférou bezstarostného venkova. Jednoduchý styl, ve kterém se budete cítit jako doma.',
      rooms: '10 pokojů',
      image: '/assets/images/venue/room-klasik.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
  ],
  en: [
    {
      name: 'Exclusive',
      subtitle: 'Themed suites',
      desc: 'Uniquely furnished suites, each with its own story — from an oriental spa room with a whirlpool to a romantic canopy suite.',
      rooms: '8 suites',
      image: '/assets/images/venue/room-exclusive.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Komfort',
      subtitle: 'Spacious rooms',
      desc: 'Comfortable rooms across three hotel wings — the ideal choice for a restful night after the wedding festivities.',
      rooms: '26 rooms',
      image: '/assets/images/venue/room-komfort.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Klasik',
      subtitle: 'Countryside charm',
      desc: 'Cozy rooms with a carefree countryside feel. Simple and clean — just like a holiday at grandma\'s.',
      rooms: '10 rooms',
      image: '/assets/images/venue/room-klasik.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
  ],
};


export default function Venue() {
  const { t, locale } = useI18n();
  const buildings = accommodationBuildings[locale];
  const [activeBuilding, setActiveBuilding] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="venue" className="relative pt-8 pb-6 md:pt-10 md:pb-8 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6 mb-10">
        <SectionHeader
          title={locale === 'cs' ? 'Místo konání' : 'Venue'}
          subtitle={locale === 'cs' ? 'Statek Všetice' : 'Statek Všetice'}
        />
      </div>

      {/* Full-width venue video */}
      <div className="relative mb-10 h-[50vh] md:h-[70vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/venue-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/video/venue.mp4" type="video/mp4" />
          <source src="/assets/video/venue.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#0A0A0A]" />
      </div>

      {/* Expand toggle */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
        >
          <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
          {expanded
            ? (locale === 'cs' ? 'Skrýt' : 'Hide')
            : (locale === 'cs' ? 'Zobrazit více' : 'Show more')}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#C9A96E]"
          >
            ↓
          </motion.span>
          <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
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

      <div className="mx-auto max-w-6xl px-6">

        {/* Intro text */}
        <motion.div
          className="mx-auto max-w-3xl text-center space-y-6 mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-base md:text-lg leading-relaxed text-[#B8A99A]">
            {locale === 'cs'
              ? 'Venkovský statek uprostřed malebné přírody. Necelá hodina z Prahy, proti proudu Vltavy, kde se poklidně tekoucí řeka promění v majestátní přehradu. Tam si řekneme své ANO.'
              : 'A countryside estate in the heart of picturesque nature. Less than an hour from Prague, upstream along the Vltava, where the gently flowing river transforms into a majestic reservoir. That is where we will say our YES.'}
          </p>
        </motion.div>

      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Map */}
        <motion.div
          className="map-container mb-8 overflow-hidden rounded-xl border border-[#2A2520]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2575.0!2d14.5138085!3d49.789348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b823ef333efd1%3A0x8703bf635045cf0!2sHotel+V%C5%A1etice!5e0!3m2!1scs!2scz!4v1770743729446!5m2!1scs!2scz"
            className="w-full h-[300px] md:h-[400px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Address & Navigate */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-[#B8A99A]">{t('venue.address') as string}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.google.com/maps/place/Statek+V%C5%A1etice/@49.789348,14.5138085,17z/data=!4m9!3m8!1s0x470b823ef333efd1:0x8703bf635045cf0!5m2!4m1!1i2!8m2!3d49.7893257!4d14.5138721!16s%2Fg%2F1pp2vg5bp?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
            >
              {t('venue.navigate') as string}
            </a>
            <a
              href="https://www.hotel-vsetice.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#2A2520] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#B8A99A] transition-all duration-500 hover:border-[#C9A96E]/30 hover:text-[#E8D5B5]"
            >
              hotel-vsetice.cz
            </a>
          </div>
        </motion.div>

        {/* Accommodation buildings */}
        <motion.div
          id="accommodation"
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-center font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light mb-6">
            {locale === 'cs' ? 'Ubytování' : 'Accommodation'}
          </h3>
          <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[#B8A99A] mb-4">
            {locale === 'cs'
              ? 'Ubytování máme zajištěno pro každého z vás — ať přijedete z blízka nebo z daleka, na obě noci. Nemusíte se tedy starat o rezervaci ani platbu, prosíme vás jen o potvrzení účasti.'
              : 'Accommodation is arranged for each of you — whether you\'re coming from near or far, for both nights. No need to worry about booking or payment, we only ask that you confirm your attendance.'}
          </p>
          <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-[#B8A99A]/70 mb-10">
            {locale === 'cs'
              ? 'Pokud budete chtít přispět, na místě bude k dispozici kasička.'
              : 'If you\'d like to contribute, there will be a collection box on-site.'}
          </p>

          {/* Room preview label */}
          <p className="text-center text-xs tracking-[0.25em] uppercase text-[#C9A96E]/60 mb-5 font-[family-name:var(--font-cormorant)]">
            {locale === 'cs' ? 'Ukázka pokojů' : 'Room preview'}
          </p>

          {/* Building tabs */}
          <div className="flex justify-center gap-3 mb-8">
            {buildings.map((building, i) => (
              <button
                key={i}
                onClick={() => setActiveBuilding(i)}
                className={`rounded-full px-5 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300 ${
                  activeBuilding === i
                    ? 'border border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                    : 'border border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
                }`}
              >
                {building.name}
              </button>
            ))}
          </div>

          {/* Active building display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBuilding}
              className="relative overflow-hidden rounded-2xl border border-[#2A2520]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative h-[300px] md:h-[450px]">
                <Image
                  src={buildings[activeBuilding].image}
                  alt={buildings[activeBuilding].name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-white font-light" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                      {buildings[activeBuilding].name}
                    </h4>
                    <span className="rounded-full border border-[#C9A96E]/50 bg-black/40 px-3 py-1 text-xs text-[#C9A96E]">
                      {buildings[activeBuilding].rooms}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#C9A96E] mb-3 font-[family-name:var(--font-cormorant)] font-semibold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.9)'}}>
                    {buildings[activeBuilding].subtitle}
                  </p>
                  <p className="text-sm md:text-base text-white/90 max-w-xl leading-relaxed mb-4" style={{textShadow: '0 1px 6px rgba(0,0,0,0.9)'}}>
                    {buildings[activeBuilding].desc}
                  </p>
                  <a
                    href={buildings[activeBuilding].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[#C9A96E] hover:text-[#D4AF37] transition-colors"
                  >
                    {locale === 'cs' ? 'Více informací' : 'More info'} &rarr;
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}
