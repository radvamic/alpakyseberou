'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import GoldParticles from '@/components/ui/GoldParticles';

const WEDDING_DATE = new Date('2026-09-26T12:00:00+02:00').getTime();

function splitText(text: string) {
  return text.split('').map((char, i) => (
    <motion.span
      key={i}
      className="inline-block"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 3.2 + i * 0.06,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  ));
}

export default function Hero() {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const updateCountdown = useCallback(() => {
    const now = Date.now();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setCountdown({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    });
  }, []);

  useEffect(() => {
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [updateCountdown]);

  const countdownItems = [
    { value: countdown.days, label: t('hero.days') as string },
    { value: countdown.hours, label: t('hero.hours') as string },
    { value: countdown.minutes, label: t('hero.minutes') as string },
    { value: countdown.seconds, label: t('hero.seconds') as string },
  ];

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/images/hero-poster.jpg"
          className="hero-video"
        >
          <source src="/assets/video/hero.webm" type="video/webm" />
          <source src="/assets/video/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-[1]" />

      {/* Gold Particles */}
      <GoldParticles />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 overlay-text">
        {/* Names */}
        <div className="flex flex-col items-center gap-2 sm:gap-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-wider text-[#F5F0E8] overflow-hidden [text-shadow:none]">
            {splitText('Klára')}
          </h1>
          <motion.span
            className="font-[family-name:var(--font-great-vibes)] text-4xl sm:text-5xl md:text-6xl text-[#d8b28c]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 3.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            &
          </motion.span>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-wider text-[#F5F0E8] overflow-hidden [text-shadow:none]">
            {splitText('Michal')}
          </h1>
        </div>

        {/* Date */}
        <motion.p
          className="mt-6 sm:mt-8 font-[family-name:var(--font-cormorant)] text-lg sm:text-xl md:text-2xl tracking-[0.3em] text-[#f1d5c4] uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.2 }}
        >
          {t('hero.date') as string}
        </motion.p>
        <motion.p
          className="mt-2 font-[family-name:var(--font-cormorant)] text-sm sm:text-base tracking-[0.2em] text-[#B8A99A]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.35 }}
        >
          {t('hero.weekend') as string}
        </motion.p>

        {/* Divider */}
        <motion.div
          className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-[#d8b28c] to-transparent"
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1, delay: 4.4 }}
        />

        {/* Countdown */}
        <motion.div
          className="mt-8 flex gap-6 sm:gap-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.6 }}
        >
          {countdownItems.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl font-light text-[#d8b28c]">
                {item.label === (t('hero.days') as string)
                  ? String(item.value)
                  : String(item.value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-xs sm:text-sm tracking-[0.2em] uppercase text-[#B8A99A]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 5 }}
        >
          <a
            href="#story"
            className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#d8b28c] transition-colors"
          >
            {t('hero.cta') as string}
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.2 }}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="w-[1px] h-8 bg-gradient-to-b from-[#d8b28c] to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
