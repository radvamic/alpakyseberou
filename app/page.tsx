'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { I18nProvider } from '@/lib/i18n';
import { readSiteLang } from '@/lib/site-lang';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import Preloader from '@/components/layout/Preloader';
import Navbar from '@/components/layout/Navbar';
import CustomCursor from '@/components/ui/CustomCursor';
import Hero from '@/components/sections/Hero';
import Story from '@/components/sections/Story';
// Po svatbě skryto: Venue (vč. ubytování), Ceremony (program), RSVP, Gifts, FAQ
// import Ceremony from '@/components/sections/Ceremony';
// import Venue from '@/components/sections/Venue';
// import RSVP from '@/components/sections/RSVP';
import Gallery from '@/components/sections/Gallery';
// import Gifts from '@/components/sections/Gifts';
// import FAQ from '@/components/sections/FAQ';
import Guestbook from '@/components/sections/Guestbook';
import WeddingPhotos from '@/components/sections/WeddingPhotos';
import QuizResults from '@/components/sections/QuizResults';
import WhyAlpacas from '@/components/sections/WhyAlpacas';
// import PhotoBoothTeaser from '@/components/sections/PhotoBoothTeaser';
import AlpacaSectionDivider from '@/components/ui/AlpacaSectionDivider';
import Footer from '@/components/layout/Footer';
import ThankYouModal from '@/components/ui/ThankYouModal';

const subscribeNoop = () => () => {};

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  // Na serveru i při hydrataci false, v prohlížeči true — stránka se kreslí až na klientu
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (!mounted) return null;

  return (
    <I18nProvider initialLocale={readSiteLang() ?? 'cs'}>
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
            {/* <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/venue2.png" imageWidth={100} imageHeight={47} />
            <Venue />
            <div className="bg-[#141414]">
              <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/ceremony.png" imageWidth={240} imageHeight={140} />
              <Ceremony />
            </div>
            <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/rsvp.png" imageWidth={165} imageHeight={75} />
            <RSVP /> */}
            {/* Po svatbě: fotky ze svatby → výsledky kvízu → nástěnka → příběh. Barvy skryté. */}
            <div className="bg-[#141414]">
              <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/photos.png" imageWidth={165} imageHeight={75} />
              <WeddingPhotos />
            </div>
            <AlpacaSectionDivider />
            <QuizResults />
            {/* <PhotoBoothTeaser /> */}
            <div className="bg-[#141414]">
              <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/guestbook.png" imageWidth={165} imageHeight={90} />
              <Guestbook />
            </div>
            <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/story.png" imageWidth={220} imageHeight={146} />
            <Story />
            <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/gallery.png" imageWidth={220} imageHeight={100} />
            <Gallery />
            <div className="bg-[#141414]">
              <AlpacaSectionDivider imageSrc="/assets/images/alpacas/web/why.png" imageWidth={200} imageHeight={140} />
              <WhyAlpacas />
            </div>
            {/* <AlpacaSectionDivider />
            <Gifts />
            <AlpacaSectionDivider />
            <FAQ /> */}
          </main>

          <Footer />
        </SmoothScrollProvider>
      </motion.div>

      {/* Po svatbě: poděkování hostům, jednou na zařízení */}
      <ThankYouModal ready={preloaderDone} />
    </I18nProvider>
  );
}
