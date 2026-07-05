'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface StepUploadProps {
  onPhotoSelected: (file: File, preview: string) => void;
}

function compressImage(file: File, maxSize: number = 2048): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.85,
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function StepUpload({ onPhotoSelected }: StepUploadProps) {
  const { t } = useI18n();
  const [preview, setPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    setPreview(url);
    setSelectedFile(compressed);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleConfirm = () => {
    if (selectedFile && preview) {
      onPhotoSelected(selectedFile, preview);
    }
  };

  const handleReset = () => {
    setPreview('');
    setSelectedFile(null);
  };

  if (preview && selectedFile) {
    return (
      <div className="flex flex-col items-center gap-6">
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl text-[#F5F0E8] text-center">
          {t('photobooth.previewTitle') as string}
        </h3>
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-[#B8A17E]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="px-6 py-3 text-sm text-[#B8A99A] hover:text-[#F5F0E8] transition-colors"
          >
            {t('photobooth.changePhoto') as string}
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-full border border-[#B8A17E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#B8A17E] transition-all duration-500 hover:bg-[#B8A17E]/10"
          >
            {t('photobooth.next') as string}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl text-[#F5F0E8] text-center">
        {t('photobooth.uploadTitle') as string}
      </h3>
      <p className="text-sm text-[#B8A99A] text-center max-w-md">
        {t('photobooth.uploadDesc') as string}
      </p>

      {/* Camera button - primary on mobile */}
      <motion.button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-[#B8A17E]/10 border border-[#B8A17E] px-8 py-4 text-[#B8A17E] text-sm tracking-[0.1em] uppercase transition-all hover:bg-[#B8A17E]/20 sm:hidden"
        whileTap={{ scale: 0.97 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        {t('photobooth.takeSelfie') as string}
      </motion.button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-[#B8A17E] bg-[#B8A17E]/10'
            : 'border-[#2A2520] hover:border-[#B8A17E]/30 hover:bg-[#1A1A1A]'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl sm:text-5xl opacity-50">🦙</div>
          <div>
            <p className="text-sm text-[#B8A17E]/80 mb-1">
              {t('photobooth.dragDrop') as string}
            </p>
            <p className="text-xs text-[#B8A99A]/60">
              {t('photobooth.maxSize') as string}
            </p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />

      {/* Camera button for desktop */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        className="hidden sm:flex items-center gap-2 text-sm text-[#B8A99A] hover:text-[#B8A17E] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        {t('photobooth.takeSelfie') as string}
      </button>
    </div>
  );
}
