'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { I18nProvider } from '@/lib/i18n';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import Preloader from '@/components/layout/Preloader';
import Navbar from '@/components/layout/Navbar';
import CustomCursor from '@/components/ui/CustomCursor';
import Hero from '@/components/sections/Hero';
import Story from '@/components/sections/Story';
import Ceremony from '@/components/sections/Ceremony';
import Venue from '@/components/sections/Venue';
import RSVP from '@/components/sections/RSVP';
import Gallery from '@/components/sections/Gallery';
import WeddingParty from '@/components/sections/WeddingParty';

import Gifts from '@/components/sections/Gifts';
import FAQ from '@/components/sections/FAQ';
import Guestbook from '@/components/sections/Guestbook';
import WeddingPhotos from '@/components/sections/WeddingPhotos';
import WhyAlpacas from '@/components/sections/WhyAlpacas';
import PhotoBoothTeaser from '@/components/sections/PhotoBoothTeaser';
import AlpacaSectionDivider from '@/components/ui/AlpacaSectionDivider';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <I18nProvider>
      <Preloader onComplete={() => setPreloaderDone(true)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: preloaderDone ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />

          <main>
            <Hero />
            <Story />
            <AlpacaSectionDivider />
            <WhyAlpacas />
            <AlpacaSectionDivider />
            <Ceremony />
            <AlpacaSectionDivider />
            <Venue />
            <AlpacaSectionDivider />
            <RSVP />
            <AlpacaSectionDivider />
            <Gallery />
            <AlpacaSectionDivider />
            <WeddingParty />
            <AlpacaSectionDivider />
            <Gifts />
            <AlpacaSectionDivider />
            <FAQ />
            <AlpacaSectionDivider />
            <Guestbook />
            <AlpacaSectionDivider />
            <PhotoBoothTeaser />
            <AlpacaSectionDivider />
            <WeddingPhotos />
          </main>

          <Footer />
        </SmoothScrollProvider>
      </motion.div>
    </I18nProvider>
  );
}
