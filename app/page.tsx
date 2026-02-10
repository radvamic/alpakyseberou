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
            <div className="section-divider" />
            <Story />
            <div className="section-divider" />
            <Ceremony />
            <div className="section-divider" />
            <Venue />
            <div className="section-divider" />
            <RSVP />
            <div className="section-divider" />
            <Gallery />
            <div className="section-divider" />
            <WeddingParty />
            <div className="section-divider" />
            <Gifts />
            <div className="section-divider" />
            <FAQ />
            <div className="section-divider" />
            <Guestbook />
            <div className="section-divider" />
            <WeddingPhotos />
          </main>

          <Footer />
        </SmoothScrollProvider>
      </motion.div>
    </I18nProvider>
  );
}
