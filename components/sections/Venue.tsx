'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

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
      name: 'Klasik',
      subtitle: 'Útulné pokoje s venkovským šarmem',
      desc: 'Příjemné pokoje, kde zakusíte atmosféru bezstarostného venkova. Jednoduchý a čistý styl, ve kterém se budete cítit jako na prázdninách u babičky.',
      rooms: '10 pokojů',
      image: '/assets/images/venue/room-klasik.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Komfort',
      subtitle: 'Prostorné pokoje pro 2–4 hosty',
      desc: 'Celkem 26 komfortních pokojů ve třech hotelových křídlech. Dva z pokojů disponují bezbariérovým přístupem. Ideální volba pro pohodlný odpočinek po svatebním veselí.',
      rooms: '26 pokojů',
      image: '/assets/images/venue/room-komfort.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Exclusive',
      subtitle: 'Originální tematická apartmá',
      desc: 'Osobitě zařízená apartmá, každé s vlastním příběhem — od orientálního Lázeňského pokoje s vířivou vanou po romantické Železné apartmá s nebesy. Ideální pro novomanžele a náročné hosty.',
      rooms: '8 apartmá',
      image: '/assets/images/venue/room-exclusive.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
  ],
  en: [
    {
      name: 'Klasik',
      subtitle: 'Cozy rooms with countryside charm',
      desc: 'Pleasant rooms where you\'ll experience the atmosphere of a carefree countryside. A simple, clean style that feels like a holiday at grandma\'s house.',
      rooms: '10 rooms',
      image: '/assets/images/venue/room-klasik.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Komfort',
      subtitle: 'Spacious rooms for 2–4 guests',
      desc: 'A total of 26 comfort rooms across three hotel wings. Two rooms feature barrier-free access. The ideal choice for a comfortable rest after the wedding festivities.',
      rooms: '26 rooms',
      image: '/assets/images/venue/room-komfort.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
    {
      name: 'Exclusive',
      subtitle: 'Original themed suites',
      desc: 'Uniquely furnished suites, each with its own story — from the oriental Spa Room with a whirlpool tub to the romantic Iron Suite with a canopy bed. Perfect for the newlyweds and discerning guests.',
      rooms: '8 suites',
      image: '/assets/images/venue/room-exclusive.jpg',
      url: 'https://www.hotel-vsetice.cz/pokoje',
    },
  ],
};

const highlights = {
  cs: [
    { icon: '🏞️', title: 'Absolutní soukromí', desc: 'Statek obklopený přírodou — nikdo vás nebude rušit. Celý areál patří jen vám.' },
    { icon: '🍽️', title: 'Vynikající gastronomie', desc: 'Každá úspěšná svatba je spojena s dokonalým gastronomickým zážitkem.' },
    { icon: '🐴', title: 'Koně & jízdárna', desc: 'Statek s vlastní jízdárnou — koně jsou součástí kouzelné atmosféry místa.' },
    { icon: '🧖', title: 'Sauna & jezírko', desc: 'Prohřejte se v sauně a osvěžte se v přírodním jezírku přímo v areálu.' },
    { icon: '🌿', title: 'Kouzelný venkov', desc: 'Malebná krajina jižně od Prahy, kde cvrčci si notují milostnou píseň.' },
    { icon: '🛏️', title: '44 pokojů', desc: 'Osobitě zařízené pokoje s ubytovací kapacitou až 130 hostů.' },
  ],
  en: [
    { icon: '🏞️', title: 'Complete Privacy', desc: 'An estate surrounded by nature — no one will disturb you. The entire venue is yours.' },
    { icon: '🍽️', title: 'Exquisite Gastronomy', desc: 'Every successful wedding is paired with a perfect gastronomic experience.' },
    { icon: '🐴', title: 'Horses & Riding', desc: 'An estate with its own riding hall — horses are part of the magical atmosphere.' },
    { icon: '🧖', title: 'Sauna & Pond', desc: 'Warm up in the sauna and refresh yourself in the natural swimming pond on-site.' },
    { icon: '🌿', title: 'Enchanting Countryside', desc: 'A picturesque landscape south of Prague where crickets sing love songs.' },
    { icon: '🛏️', title: '44 Rooms', desc: 'Uniquely furnished rooms with accommodation capacity for up to 130 guests.' },
  ],
};

export default function Venue() {
  const { t, locale } = useI18n();
  const features = t('venue.features') as unknown as Feature[];
  const buildings = accommodationBuildings[locale];
  const venueHighlights = highlights[locale];
  const [activeBuilding, setActiveBuilding] = useState(0);

  return (
    <section id="venue" className="relative py-24 md:py-32 bg-[#0A0A0A]">
      {/* Full-width venue video */}
      <div className="relative mb-16 md:mb-24 h-[50vh] md:h-[70vh] overflow-hidden">
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
        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center overlay-text">
          <motion.h2
            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-7xl text-[#F5F0E8] font-light tracking-wider"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t('venue.title') as string}
          </motion.h2>
          <motion.p
            className="mt-4 font-[family-name:var(--font-cormorant)] text-lg md:text-xl text-[#E8D5B5] tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('venue.subtitle') as string}
          </motion.p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Description */}
        <motion.p
          className="mx-auto max-w-3xl text-center text-base md:text-lg leading-relaxed text-[#B8A99A] mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {t('venue.description') as string}
        </motion.p>

        {/* Fun fact */}
        <motion.div
          className="mx-auto max-w-2xl mb-20 rounded-xl border border-[#C9A96E]/20 bg-[#1E1B18] p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm text-[#E8D5B5]">{t('venue.funFact') as string}</p>
        </motion.div>

        {/* Why this venue - Highlights */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-center font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light mb-12">
            {locale === 'cs' ? 'Proč právě Hotel Všetice' : 'Why Hotel Všetice'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {venueHighlights.map((item, i) => (
              <motion.div
                key={i}
                className="group flex items-start gap-4 rounded-xl border border-[#2A2520] bg-[#141414] p-5 hover:border-[#C9A96E]/30 transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <div>
                  <h4 className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-[#F5F0E8] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#B8A99A] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Accommodation buildings */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-center font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light mb-4">
            {locale === 'cs' ? 'Ubytování' : 'Accommodation'}
          </h3>
          <p className="text-center text-sm text-[#B8A99A] mb-10">
            {locale === 'cs'
              ? 'Tři kategorie pokojů pro každý vkus'
              : 'Three room categories for every taste'}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 overlay-text">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light">
                      {buildings[activeBuilding].name}
                    </h4>
                    <span className="rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-3 py-1 text-xs text-[#C9A96E]">
                      {buildings[activeBuilding].rooms}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#C9A96E] mb-3 font-[family-name:var(--font-cormorant)] font-semibold">
                    {buildings[activeBuilding].subtitle}
                  </p>
                  <p className="text-sm md:text-base text-[#E8D5B5] max-w-xl leading-relaxed mb-4">
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

        {/* Practical info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group flex flex-col items-center gap-3 rounded-xl border border-[#2A2520] bg-[#141414] p-6 text-center hover:border-[#C9A96E]/30 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </span>
              <h3 className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-[#F5F0E8]">
                {feature.title}
              </h3>
              <p className="text-xs text-[#B8A99A]">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

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
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-[#B8A99A]">{t('venue.address') as string}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.google.com/maps/place/Hotel+V%C5%A1etice/@49.789348,14.5138085,17z"
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
      </div>
    </section>
  );
}
