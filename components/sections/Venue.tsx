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
      name: 'Mlýn',
      subtitle: 'Historická budova s moderním nádechem',
      desc: 'Hlavní budova Mlýna Davídkov je autentickým místem s kouzelnou atmosférou. Dominantou je prostorná mlýnice, kde můžete cítit historii každého kamene. V přízemí se nachází stylová restaurace a v srdci budovy útulný krb, který dodává teplo a pohodu.',
      rooms: '13 pokojů',
      image: '/assets/images/venue/mlyn-building.webp',
      url: 'https://www.mlyndavidkov.cz/pokoje/mlyn',
    },
    {
      name: 'Šalanda',
      subtitle: 'Ubytování v přírodě',
      desc: 'Šalanda poskytuje komfortní ubytování s moderním zázemím. Pokoje jsou útulné a zaručují klidný odpočinek v přírodě. V budově se nachází stáje, které přidávají místu rustikální atmosféru.',
      rooms: '10 pokojů',
      image: '/assets/images/venue/salanda-building.webp',
      url: 'https://www.mlyndavidkov.cz/pokoje/salanda',
    },
    {
      name: 'Vila Toyen',
      subtitle: 'Soukromí v dechberoucí přírodě',
      desc: 'Elegantní secesní vila naproti hlavnímu areálu s nezaměnitelnou atmosférou. Nabízí stylové prostory s nádherným interiérem, inspirativní zahradou a okolní přírodou. Spojuje eleganci, klid a exkluzivní prostředí.',
      rooms: '5 pokojů',
      image: '/assets/images/venue/vila-toyen-building.webp',
      url: 'https://www.mlyndavidkov.cz/pokoje/vila-toyen',
    },
  ],
  en: [
    {
      name: 'Mlýn (The Mill)',
      subtitle: 'A historic building with a modern touch',
      desc: 'The main building of Mlýn Davídkov is an authentic place with a magical atmosphere. Its centerpiece is the spacious mill hall, where you can feel the history in every stone. The ground floor features a stylish restaurant and a cozy fireplace in the heart of the building.',
      rooms: '13 rooms',
      image: '/assets/images/venue/mlyn-building.webp',
      url: 'https://www.mlyndavidkov.cz/en/pokoje/mlyn',
    },
    {
      name: 'Šalanda',
      subtitle: 'Accommodation in nature',
      desc: 'Šalanda offers comfortable accommodation with modern facilities. The rooms are cozy and guarantee a peaceful rest surrounded by nature. The building includes stables that add a rustic atmosphere to the place.',
      rooms: '10 rooms',
      image: '/assets/images/venue/salanda-building.webp',
      url: 'https://www.mlyndavidkov.cz/en/pokoje/salanda',
    },
    {
      name: 'Vila Toyen',
      subtitle: 'Privacy in breathtaking nature',
      desc: 'An elegant Art Nouveau villa opposite the main grounds with an unmistakable atmosphere. It offers stylish spaces with a beautiful interior, an inspiring garden and surrounding nature. It combines elegance, tranquility and an exclusive setting.',
      rooms: '5 rooms',
      image: '/assets/images/venue/vila-toyen-building.webp',
      url: 'https://www.mlyndavidkov.cz/en/pokoje/vila-toyen',
    },
  ],
};

const highlights = {
  cs: [
    { icon: '💒', title: '1000+ svateb', desc: 'Legendární svatební mlýn, kde se odehrálo přes tisíc příběhů lásky.' },
    { icon: '🏞️', title: 'Absolutní soukromí', desc: 'Resort obklopený přírodou — nikdo vás nebude rušit. Celý areál patří jen vám.' },
    { icon: '🍽️', title: 'Vynikající gastronomie', desc: 'Každá úspěšná svatba je spojena s dokonalým gastronomickým zážitkem.' },
    { icon: '🌊', title: '6 obřadních míst', desc: 'Molo, Bašta, Palouk, Vila, Stodola, Nádvoří — vyberte si to své.' },
    { icon: '👰', title: 'Přípravny pro novomanžele', desc: 'Speciální přípravna pro nevěstu i ženicha a novomanželský pokoj.' },
    { icon: '🌿', title: 'Malebné údolí', desc: 'Dechberoucí příroda, která umocňuje dokonalý zážitek z každé strany.' },
  ],
  en: [
    { icon: '💒', title: '1000+ Weddings', desc: 'A legendary wedding mill where over a thousand love stories have unfolded.' },
    { icon: '🏞️', title: 'Complete Privacy', desc: 'A resort surrounded by nature — no one will disturb you. The entire venue is yours.' },
    { icon: '🍽️', title: 'Exquisite Gastronomy', desc: 'Every successful wedding is paired with a perfect gastronomic experience.' },
    { icon: '🌊', title: '6 Ceremony Spots', desc: 'Molo, Bašta, Palouk, Vila, Stodola, Nádvoří — pick your favorite.' },
    { icon: '👰', title: 'Bridal & Groom Suites', desc: 'Dedicated preparation rooms for the bride and groom, plus a newlywed suite.' },
    { icon: '🌿', title: 'Picturesque Valley', desc: 'Breathtaking nature that enhances the perfect experience from every angle.' },
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
      {/* Full-width aerial photo */}
      <div className="relative mb-16 md:mb-24 h-[50vh] md:h-[70vh] overflow-hidden">
        <Image
          src="/assets/images/venue/aerial.webp"
          alt="Mlýn Davídkov - aerial view"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0A0A0A]" />
        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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

        {/* Why Mlýn is unique - Highlights */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-center font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] font-light mb-12">
            {locale === 'cs' ? 'Proč právě Mlýn Davídkov' : 'Why Mlýn Davídkov'}
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
              ? 'Jeden resort, více stylů ubytování'
              : 'One resort, multiple accommodation styles'}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2567.9193529732015!2d14.991282699999996!3d49.9378545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470c6e141bb905d5%3A0x39685235cf89b41!2zTWzDvW4gRGF2w61ka292!5e0!3m2!1scs!2scz!4v1770743729446!5m2!1scs!2scz"
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
              href="https://www.google.com/maps/place/Ml%C3%BDn+Dav%C3%ADdkov/@49.9378545,14.9912827,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
            >
              {t('venue.navigate') as string}
            </a>
            <a
              href="https://www.mlyndavidkov.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#2A2520] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#B8A99A] transition-all duration-500 hover:border-[#C9A96E]/30 hover:text-[#E8D5B5]"
            >
              mlyndavidkov.cz
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
