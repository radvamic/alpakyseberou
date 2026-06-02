'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraShutterProps {
  guestName: string;
  photosTaken: number;
  maxPhotos: number;
  onPhotoTaken: (file: File) => Promise<void>;
  uploading: boolean;
  uploadError: string | null;
}

export default function CameraShutter({
  guestName,
  photosTaken,
  maxPhotos,
  onPhotoTaken,
  uploading,
  uploadError,
}: CameraShutterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState(false);

  const remaining = maxPhotos - photosTaken;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same photo can trigger again if needed
    e.target.value = '';
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    await onPhotoTaken(file);
  };

  const triggerCamera = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between py-10 px-6">
      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center w-full">
        <span className="block font-[family-name:var(--font-great-vibes)] text-xl text-[#C9A96E]">
          Klára &amp; Michal
        </span>
        <p className="text-[#B8A99A] text-sm mt-1">
          Ahoj, <span className="text-[#F5F0E8]">{guestName}</span>
        </p>
      </div>

      {/* Film counter */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="text-center">
          <span className="font-[family-name:var(--font-playfair)] text-6xl font-light text-[#F5F0E8]">
            {remaining}
          </span>
          <span className="text-[#4A4540] text-lg"> / {maxPhotos}</span>
          <p className="text-[#B8A99A] text-sm mt-1">
            {remaining === 1 ? 'zbývá 1 snímek' : `zbývá ${remaining} snímků`}
          </p>
        </div>

        {/* Film strip progress */}
        <div className="w-full flex gap-[3px]">
          {Array.from({ length: maxPhotos }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < photosTaken ? '#C9A96E' : '#2A2520',
              }}
            />
          ))}
        </div>
      </div>

      {/* Shutter button */}
      <div className="flex flex-col items-center gap-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <motion.button
          onClick={triggerCamera}
          disabled={uploading}
          whileTap={{ scale: 0.94 }}
          className="relative w-24 h-24 rounded-full bg-[#C9A96E] shadow-[0_0_40px_rgba(201,169,110,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Vyfotit"
        >
          <div className="w-16 h-16 rounded-full border-4 border-[#0A0A0A] bg-[#D4AF37]" />
          {uploading && (
            <div className="absolute inset-0 rounded-full border-4 border-[#F5F0E8] border-t-transparent animate-spin" />
          )}
        </motion.button>

        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="text-red-400 text-sm">{uploadError}</p>
              <button
                onClick={triggerCamera}
                className="text-[#C9A96E] text-sm underline underline-offset-2"
              >
                Zkusit znovu
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[#4A4540] text-xs text-center">
          {uploading ? 'Nahráváme fotku…' : 'Stiskni a foť'}
        </p>
      </div>
    </div>
  );
}
