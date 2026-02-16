'use client';

import { motion } from 'framer-motion';

/** Minimal alpaca silhouette for divider - two facing each other */
function AlpacaSilhouette({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 48 24"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Head, ear, neck - minimal line style */}
      <path
        d="M8 18 L10 14 L14 12 L18 14 L20 18 L18 20 L14 22 L10 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M12 10 L10 6 L12 8 L14 6 Z" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M14 18 L16 14 L24 12" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
    </motion.svg>
  );
}

export default function AlpacaSectionDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-6" aria-hidden>
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#C9A96E]/60" />
      <div className="flex items-center justify-center gap-3 text-[#C9A96E]/80">
        <AlpacaSilhouette className="h-6 w-12" />
        <AlpacaSilhouette className="h-6 w-12" flip />
      </div>
      <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#C9A96E]/60" />
    </div>
  );
}
