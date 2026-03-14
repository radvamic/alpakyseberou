'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Locale } from '@/lib/i18n';

interface StepGeneratingProps {
  locale: Locale;
}

const messagesCs = [
  'Alpaka bere štětec do ruky...',
  'Míchá barvy na paletě...',
  'Kreslí první tahy...',
  'Přidává magické detaily...',
  'Kontroluje proporce...',
  'Poslední úpravy...',
  'Skoro hotovo!',
];

const messagesEn = [
  'The alpaca picks up a brush...',
  'Mixing colors on the palette...',
  'Drawing the first strokes...',
  'Adding magical details...',
  'Checking proportions...',
  'Final touches...',
  'Almost done!',
];

export default function StepGenerating({ locale }: StepGeneratingProps) {
  const messages = locale === 'cs' ? messagesCs : messagesEn;
  const [msgIndex, setMsgIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [messages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-8">
      {/* Animated alpaca painter */}
      <div className="relative">
        <motion.div
          className="text-7xl sm:text-8xl"
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🦙
        </motion.div>
        <motion.div
          className="absolute -right-4 -top-2 text-3xl"
          animate={{ rotate: [0, -20, 0], x: [-2, 4, -2] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎨
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#C9A96E]"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Status message */}
      <motion.p
        key={msgIndex}
        className="text-sm text-[#E8D5B5] text-center font-[family-name:var(--font-cormorant)] text-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {messages[msgIndex]}
      </motion.p>

      {/* Timer */}
      <p className="text-xs text-[#6A6560]">
        {elapsed}s
        {elapsed > 25 && (
          <span className="ml-2 text-[#B8A99A]">
            {locale === 'cs' ? 'Ještě chvilku...' : 'Just a moment...'}
          </span>
        )}
      </p>
    </div>
  );
}
