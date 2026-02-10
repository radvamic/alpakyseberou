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
            {/* Monogram */}
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <svg width="120" height="120" viewBox="0 0 120 120" className="overflow-visible">
                {/* Gold circle drawing */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="55"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                />
              </svg>
              <motion.span
                className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-great-vibes)] text-4xl text-[#C9A96E]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
              >
                M & K
              </motion.span>
            </motion.div>

            {/* Date */}
            <motion.p
              className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.3em] text-[#B8A99A] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              29 . 08 . 2026
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
