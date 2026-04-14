'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Alpacas */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/alpacas/web/preloader.png"
                alt="Alpaky"
                width={260}
                height={130}
                className="object-contain"
              />
            </motion.div>

            {/* Monogram */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <svg width="160" height="160" viewBox="0 0 160 160" className="absolute overflow-visible">
                <motion.circle
                  cx="80"
                  cy="80"
                  r="75"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                />
              </svg>
              <motion.div
                className="relative w-[170px] h-[170px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
              >
                <span className="absolute top-[10px] left-[12px] font-[family-name:var(--font-great-vibes)] text-6xl leading-none text-[#C9A96E]">K</span>
                <span className="absolute top-[65px] left-[77px] font-[family-name:var(--font-great-vibes)] text-4xl leading-none text-[#C9A96E]">&</span>
                <span className="absolute top-[106px] left-[68px] font-[family-name:var(--font-great-vibes)] text-6xl leading-none text-[#C9A96E]">M</span>
              </motion.div>
            </motion.div>

            {/* Date */}
            <motion.p
              className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.3em] text-[#B8A99A] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              26 . 09 . 2026
            </motion.p>

            {/* Loading line */}
            <motion.div
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
