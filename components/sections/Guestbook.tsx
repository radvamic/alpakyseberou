'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import Image from 'next/image';

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  photos: string[];
  isPublic: boolean;
  createdAt: string;
}

export default function Guestbook() {
  const { t, locale } = useI18n();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/guestbook')
      .then((r) => r.json())
      .then((data: GuestbookEntry[]) => setEntries(data))
      .catch(() => {});
  }, [submitted]);

  const publicEntries = entries.filter((e) => e.isPublic);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('message', message);
    formData.append('isPublic', String(isPublic));
    photos.forEach((p) => formData.append('photos', p));

    try {
      await fetch('/api/guestbook', { method: 'POST', body: formData });
    } catch {
      // Continue
    }

    setName('');
    setMessage('');
    setPhotos([]);
    setPreviews([]);
    setIsPublic(true);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <section id="guestbook" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeader
          title={t('guestbook.title') as string}
          subtitle={t('guestbook.subtitle') as string}
        />

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#C9A96E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#C9A96E]/30 group-hover:bg-[#C9A96E]/60 transition-colors duration-300" />
            {expanded ? (locale === 'cs' ? 'Skrýt' : 'Hide') : (locale === 'cs' ? 'Zanechat vzkaz' : 'Leave a message')}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#C9A96E]"
            >↓</motion.span>
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

        {/* Form */}
        <motion.div
          className="mb-20 rounded-2xl border border-[#2A2520] bg-[#111111] p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-4xl mb-4">💛</div>
                <p className="text-[#C9A96E] text-lg">
                  {t('guestbook.success') as string}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div>
                  <label className="block mb-2 text-sm text-[#C9A96E]">
                    {t('guestbook.name') as string}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#2A2520] bg-[#1A1A1A] px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:border-[#C9A96E]/50 focus:outline-none transition-colors"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-[#C9A96E]">
                    {t('guestbook.message') as string}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-xl border border-[#2A2520] bg-[#1A1A1A] px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:border-[#C9A96E]/50 focus:outline-none transition-colors resize-none"
                    placeholder="..."
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block mb-2 text-sm text-[#C9A96E]">
                    {t('guestbook.photos') as string}
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-[#2A2520] px-6 py-3 text-sm text-[#B8A99A] hover:border-[#C9A96E]/30 transition-colors">
                    📷 {t('guestbook.photos') as string}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {previews.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {previews.map((src, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2A2520] group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibility toggle */}
                <div>
                  <label className="block mb-3 text-sm text-[#C9A96E]">
                    {t('guestbook.visibility') as string}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex-1 rounded-xl border px-4 py-4 text-left transition-all duration-300 ${
                        isPublic
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                          : 'border-[#2A2520] bg-[#1A1A1A] hover:border-[#2A2520]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isPublic ? 'border-[#C9A96E]' : 'border-[#4A4540]'
                          }`}
                        >
                          {isPublic && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#C9A96E]" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            isPublic ? 'text-[#C9A96E]' : 'text-[#B8A99A]'
                          }`}
                        >
                          🌐 {t('guestbook.public') as string}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8A99A] ml-8">
                        {t('guestbook.publicDesc') as string}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex-1 rounded-xl border px-4 py-4 text-left transition-all duration-300 ${
                        !isPublic
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                          : 'border-[#2A2520] bg-[#1A1A1A] hover:border-[#2A2520]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            !isPublic ? 'border-[#C9A96E]' : 'border-[#4A4540]'
                          }`}
                        >
                          {!isPublic && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#C9A96E]" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            !isPublic ? 'text-[#C9A96E]' : 'text-[#B8A99A]'
                          }`}
                        >
                          🔒 {t('guestbook.private') as string}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8A99A] ml-8">
                        {t('guestbook.privateDesc') as string}
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10"
                >
                  {t('guestbook.submit') as string}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Public message wall */}
        {publicEntries.length > 0 && (
          <div>
            <motion.h3
              className="text-center font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl text-[#F5F0E8] mb-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              💌
            </motion.h3>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {publicEntries
                .slice()
                .reverse()
                .map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    className="break-inside-avoid rounded-xl border border-[#2A2520] bg-[#111111] p-5 hover:border-[#C9A96E]/20 transition-colors duration-500"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    {/* Photos at the top, Pinterest-style */}
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="mb-4 -mt-5 -mx-5 rounded-t-xl overflow-hidden">
                        {entry.photos.length === 1 ? (
                          <div
                            className="relative w-full aspect-[4/3] cursor-pointer"
                            onClick={() => setLightboxPhoto(entry.photos[0])}
                          >
                            <Image
                              src={entry.photos[0]}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-0.5">
                            {entry.photos.map((photo, j) => (
                              <div
                                key={j}
                                className="relative aspect-square cursor-pointer"
                                onClick={() => setLightboxPhoto(photo)}
                              >
                                <Image
                                  src={photo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 16vw"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    <p className="text-sm text-[#C9A96E]/80 leading-relaxed mb-4 italic">
                      &ldquo;{entry.message}&rdquo;
                    </p>

                    {/* Author & date */}
                    <div className="flex items-center gap-3 pt-3 border-t border-[#2A2520]/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A96E]/30 to-[#C9A96E]/10 flex items-center justify-center text-xs text-[#C9A96E] font-semibold">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-[family-name:var(--font-cormorant)] text-sm text-[#F5F0E8] font-semibold block">
                          {entry.name}
                        </span>
                        <span className="text-[10px] text-[#B8A99A]/60">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Image
                src={lightboxPhoto}
                alt=""
                width={1200}
                height={900}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#141414]/80 border border-[#2A2520] flex items-center justify-center text-[#B8A99A] hover:text-[#C9A96E] hover:border-[#C9A96E]/50 transition-all duration-300"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
