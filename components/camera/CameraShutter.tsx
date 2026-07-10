'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualViewportBottomInset } from '@/hooks/useVisualViewportBottomInset';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const remaining = maxPhotos - photosTaken;
  const browserBottomInset = useVisualViewportBottomInset();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tvůj prohlížeč nepodporuje přímé focení. Zkus Safari nebo Chrome.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video.srcObject = stream;
      await video.play();
      setCameraReady(true);
    } catch {
      setCameraError(
        'Potřebujeme přístup ke kameře. Povol ho v nastavení prohlížeče a obnov stránku.',
      );
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = async () => {
    if (uploading || !cameraReady || !videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });
    if (!blob) return;

    const file = new File([blob], `photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    await onPhotoTaken(file);
  };

  const bottomPad =
    browserBottomInset > 0
      ? `calc(max(1rem, env(safe-area-inset-bottom, 0px)) + ${browserBottomInset}px)`
      : 'max(1rem, env(safe-area-inset-bottom, 0px))';

  return (
    <div className="h-dvh max-h-dvh bg-[#0A0A0A] flex flex-col items-center overflow-hidden overscroll-none pt-[max(0.75rem,env(safe-area-inset-top,0px))] px-4">
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

      <div className="text-center w-full shrink-0">
        <span className="block font-[family-name:var(--font-great-vibes)] text-xl text-[#d8b28c]">
          Klára &amp; Michal
        </span>
        <p className="text-[#B8A99A] text-sm mt-1">
          Ahoj, <span className="text-[#F5F0E8]">{guestName}</span>
        </p>
      </div>

      {/* Live viewfinder — no iOS "Retake" sheet */}
      <div className="relative flex-1 min-h-0 w-full max-w-sm my-2 flex items-center justify-center">
        <div className="relative h-full max-h-full w-full aspect-[3/4] max-w-sm overflow-hidden border border-[#d8b28c]/20 bg-[#111]">
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#d8b28c]/40 z-10" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#d8b28c]/40 z-10" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#d8b28c]/40 z-10" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#d8b28c]/40 z-10" />

        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-[#B8A99A] text-sm">{cameraError}</p>
            <button
              type="button"
              onClick={startCamera}
              className="text-[#d8b28c] text-sm underline underline-offset-2"
            >
              Zkusit znovu
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#d8b28c] border-t-transparent animate-spin" />
              </div>
            )}
          </>
        )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-xs shrink-0">
        <div className="text-center">
          <span className="font-[family-name:var(--font-playfair)] text-5xl font-light text-[#F5F0E8]">
            {remaining}
          </span>
          <span className="text-[#4A4540] text-lg"> / {maxPhotos}</span>
          <p className="text-[#B8A99A] text-sm mt-1">
            {remaining === 1 ? 'zbývá 1 snímek' : `zbývá ${remaining} snímků`}
          </p>
        </div>

        <div className="w-full flex gap-[3px]">
          {Array.from({ length: maxPhotos }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < photosTaken ? '#d8b28c' : '#2A2520',
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="flex flex-col items-center gap-3 shrink-0 w-full"
        style={{ paddingBottom: bottomPad }}
      >
        <motion.button
          type="button"
          onClick={capturePhoto}
          disabled={uploading || !cameraReady || !!cameraError}
          whileTap={{ scale: 0.94 }}
          className="relative w-24 h-24 rounded-full bg-[#d8b28c] shadow-[0_0_40px_rgba(201,169,110,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Vyfotit"
        >
          <div className="w-16 h-16 rounded-full border-4 border-[#0A0A0A] bg-[#e8c9a0]" />
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
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady || uploading}
                className="text-[#d8b28c] text-sm underline underline-offset-2 disabled:opacity-50"
              >
                Zkusit znovu
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[#4A4540] text-xs text-center">
          {uploading ? 'Nahráváme fotku…' : cameraReady ? 'Stiskni a foť' : 'Načítáme kameru…'}
        </p>
      </div>
    </div>
  );
}
