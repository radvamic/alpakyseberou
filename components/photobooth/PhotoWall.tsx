'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';
import { getMotifById } from './motifs';

interface WallEntry {
  id: number;
  userName: string;
  generatedPhotoUrl: string;
  category: string;
  motifId: string;
  createdAt: string;
}

export default function PhotoWall() {
  const { t, locale } = useI18n();
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/photobooth/wall');
      const data = await res.json();
      setEntries(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#C9A96E]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className="mt-16 sm:mt-20">
      <div className="text-center mb-10">
        <motion.h3
          className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl text-[#F5F0E8]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('photobooth.wallTitle') as string}
        </motion.h3>
        <motion.div
          className="mx-auto mt-4 h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent"
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {entries.map((entry, i) => {
          const motif = getMotifById(entry.motifId);
          return (
            <motion.div
              key={entry.id}
              className="break-inside-avoid rounded-xl border border-[#2A2520] bg-[#111111] overflow-hidden hover:border-[#C9A96E]/20 transition-colors duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setLightboxUrl(entry.generatedPhotoUrl)}
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={entry.generatedPhotoUrl}
                  alt={`${entry.userName}'s creation`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C9A96E]/30 to-[#C9A96E]/10 flex items-center justify-center text-xs text-[#C9A96E] font-semibold shrink-0">
                  {entry.userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span                     className="font-[family-name:var(--font-cormorant)] text-sm text-[#F5F0E8] font-semibold block truncate">
                    {entry.userName}
                  </span>
                  <span className="text-[10px] text-[#B8A99A]/60">
                    {motif ? (locale === 'cs' ? motif.nameCs : motif.nameEn) : ''} · {formatDate(entry.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Image
                src={lightboxUrl}
                alt=""
                width={1024}
                height={1024}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all duration-300"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
