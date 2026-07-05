'use client';

import { motion } from 'framer-motion';

interface AlpacaSectionDividerProps {
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export default function AlpacaSectionDivider({
  imageSrc,
  imageWidth = 180,
  imageHeight = 100,
}: AlpacaSectionDividerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10" aria-hidden>
      <div className="flex items-center justify-center gap-4 w-full">
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#B8A17E]/40" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              width={imageWidth}
              height={imageHeight}
              style={{ width: `${imageWidth}px`, height: `${imageHeight}px`, flexShrink: 0 }}
              className="opacity-70 block"
            />
          ) : (
            <div className="flex items-center gap-1 text-[#B8A17E]/50">
              <svg viewBox="0 0 24 4" className="w-6 h-1">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                <circle cx="22" cy="2" r="1.5" fill="currentColor" />
              </svg>
            </div>
          )}
        </motion.div>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#B8A17E]/40" />
      </div>
    </div>
  );
}
