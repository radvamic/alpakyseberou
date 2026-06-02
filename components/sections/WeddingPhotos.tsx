'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import UploadedPhotosGallery from '@/components/sections/wedding-photos/UploadedPhotosGallery';

// ============================================================
// CONFIGURE YOUR SHARED ALBUM LINKS HERE
// Replace these placeholder URLs with your actual shared album links.
// ============================================================
const GOOGLE_PHOTOS_ALBUM_URL = 'https://photos.app.goo.gl/REPLACE_WITH_YOUR_LINK';
const ICLOUD_ALBUM_URL = 'https://www.icloud.com/sharedalbum/REPLACE_WITH_YOUR_LINK';
// ============================================================

export default function WeddingPhotos() {
  const { t, locale } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [galleryRefresh, setGalleryRefresh] = useState(0);
  const [showWebUpload, setShowWebUpload] = useState(false);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const all = [...files, ...Array.from(newFiles)].slice(0, 20);
    setFiles(all);
    setPreviews(all.map((f) => URL.createObjectURL(f)));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('name', name || 'Anonym');
    files.forEach((f) => formData.append('photos', f));

    try {
      await fetch('/api/photos', { method: 'POST', body: formData });
      setGalleryRefresh((k) => k + 1);
    } catch {
      // Continue
    }

    setName('');
    setFiles([]);
    setPreviews([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const [expanded, setExpanded] = useState(false);

  const albumCards = [
    {
      title: 'Google Photos',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
          <path d="M12 7.5V1.5C8.96 1.5 6.3 3.18 4.93 5.68L9.46 12H12V7.5Z" fill="#EA4335"/>
          <path d="M16.5 12H22.5C22.5 8.96 20.82 6.3 18.32 4.93L12 9.46V12H16.5Z" fill="#4285F4"/>
          <path d="M12 16.5V22.5C15.04 22.5 17.7 20.82 19.07 18.32L14.54 12H12V16.5Z" fill="#34A853"/>
          <path d="M7.5 12H1.5C1.5 15.04 3.18 17.7 5.68 19.07L12 14.54V12H7.5Z" fill="#FBBC05"/>
        </svg>
      ),
      desc: locale === 'cs'
        ? 'Funguje na iPhonu i Androidu. Fotky se nahrávají na pozadí automaticky.'
        : 'Works on both iPhone and Android. Photos upload in the background automatically.',
      url: GOOGLE_PHOTOS_ALBUM_URL,
      color: '#4285F4',
    },
    {
      title: 'iCloud Album',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#B8A99A">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      ),
      desc: locale === 'cs'
        ? 'Pro uživatele Apple. Nativní integrace, bleskové nahrávání.'
        : 'For Apple users. Native integration, lightning-fast uploads.',
      url: ICLOUD_ALBUM_URL,
      color: '#A2AAAD',
    },
  ];

  return (
    <section id="wedding-photos" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          title={t('weddingPhotos.title') as string}
          subtitle={t('weddingPhotos.subtitle') as string}
        />

        {/* Expand toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
            {expanded
              ? (locale === 'cs' ? 'Skrýt' : 'Hide')
              : (locale === 'cs' ? 'Zobrazit' : 'Show')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#C9A96E]"
            >
              ↓
            </motion.span>
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* How it works */}
              <div className="text-center mb-12">
                <p className="text-base md:text-lg text-[#B8A99A] leading-relaxed max-w-2xl mx-auto">
                  {locale === 'cs'
                    ? 'Naskenujte QR kód nebo klikněte na tlačítko — otevře se sdílené album, kam můžete přidávat fotky přímo z telefonu. Fotky se nahrávají na pozadí, takže nemusíte čekat.'
                    : 'Scan the QR code or tap the button — it will open a shared album where you can add photos directly from your phone. Photos upload in the background, so no waiting around.'}
                </p>
              </div>

              {/* Shared Album Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {albumCards.map((album, i) => (
                  <motion.div
                    key={i}
                    className="group rounded-2xl border border-[#2A2520] bg-[#111111] p-8 text-center hover:border-[#C9A96E]/20 transition-all duration-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {album.icon}
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#F5F0E8] font-light">
                        {album.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[#B8A99A] mb-6 leading-relaxed">
                      {album.desc}
                    </p>
                    <div className="flex justify-center mb-6">
                      <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2520] p-4 inline-block">
                        <QRCodeSVG
                          value={album.url}
                          size={140}
                          level="M"
                          bgColor="#1A1A1A"
                          fgColor="#C9A96E"
                        />
                      </div>
                    </div>
                    <a
                      href={album.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/30 px-6 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:border-[#C9A96E] hover:bg-[#C9A96E]/10"
                    >
                      {locale === 'cs' ? 'Otevřít album' : 'Open album'}
                    </a>
                  </motion.div>
                ))}
              </div>

              {/* Steps */}
              <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(locale === 'cs'
                  ? [
                      { step: '1', title: 'Naskenujte QR', desc: 'Otevřete fotoaparát a namiřte na QR kód' },
                      { step: '2', title: 'Přidejte fotky', desc: 'Vyberte fotky z galerie a přidejte do alba' },
                      { step: '3', title: 'Hotovo!', desc: 'Fotky se nahrají na pozadí automaticky' },
                    ]
                  : [
                      { step: '1', title: 'Scan QR', desc: 'Open your camera and point at the QR code' },
                      { step: '2', title: 'Add photos', desc: 'Select photos from gallery and add to album' },
                      { step: '3', title: 'Done!', desc: 'Photos upload in the background automatically' },
                    ]
                ).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-[#2A2520] bg-[#111111] p-5"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#C9A96E]/30 text-xs text-[#C9A96E] font-semibold">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-[family-name:var(--font-cormorant)] text-base font-semibold text-[#F5F0E8] mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#B8A99A]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Web Upload fallback */}
              <div className="text-center">
                <button
                  onClick={() => setShowWebUpload(!showWebUpload)}
                  className="text-xs tracking-[0.15em] uppercase text-[#B8A99A]/60 hover:text-[#B8A99A] transition-colors"
                >
                  {locale === 'cs'
                    ? showWebUpload ? 'Skrýt nahrávání přes web' : 'Nebo nahrát fotky přes web'
                    : showWebUpload ? 'Hide web upload' : 'Or upload photos via web'}
                </button>
              </div>

              {showWebUpload && (
                <motion.div
                  className="mt-8 rounded-2xl border border-[#2A2520] bg-[#111111] p-6 md:p-10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.4 }}
                >
                  {submitted ? (
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-4xl mb-4">📸</div>
                      <p className="text-[#C9A96E]">{t('weddingPhotos.success') as string}</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block mb-2 text-sm text-[#C9A96E]">
                          {t('weddingPhotos.name') as string}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jan Novák"
                          className="w-full rounded-xl border border-[#2A2520] bg-[#1A1A1A] px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:border-[#C9A96E]/50 focus:outline-none transition-colors"
                        />
                      </div>

                      <div
                        className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
                          isDragging
                            ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                            : 'border-[#2A2520] hover:border-[#C9A96E]/30'
                        }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-4xl mb-3 opacity-50">📸</div>
                        <p className="text-sm text-[#B8A99A]">
                          {t('weddingPhotos.dragDrop') as string}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && addFiles(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      {previews.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {previews.map((src, i) => (
                            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-[#2A2520]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={files.length === 0}
                        className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {t('weddingPhotos.submit') as string}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              <UploadedPhotosGallery
                locale={locale}
                refreshKey={galleryRefresh}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
