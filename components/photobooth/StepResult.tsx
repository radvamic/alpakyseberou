'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

interface StepResultProps {
  generatedUrl: string;
  category: string;
  motifId: string;
  remaining: number;
  onTryAnother: () => void;
  onNewPhoto: () => void;
  onSaved: () => void;
}

export default function StepResult({
  generatedUrl,
  category,
  motifId,
  remaining,
  onTryAnother,
  onNewPhoto,
  onSaved,
}: StepResultProps) {
  const { t, locale } = useI18n();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savePublic, setSavePublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDownload = async () => {
    try {
      const res = await fetch(generatedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fotokoutek-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(generatedUrl);
        const blob = await res.blob();
        const file = new File([blob], 'fotokoutek.png', { type: 'image/png' });
        await navigator.share({
          title: 'AI Fotokoutek - Klára & Michal',
          files: [file],
        });
      } catch {
        // Share cancelled or failed
      }
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/photobooth/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: saveName.trim(),
          originalPhotoUrl: '',
          generatedPhotoUrl: generatedUrl,
          category,
          motifId,
          isPublic: savePublic,
        }),
      });
      setSaved(true);
      setShowSaveModal(false);
      onSaved();
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-col items-center gap-5">
      <h3 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl text-[#F5F0E8] text-center">
        {t('photobooth.resultTitle') as string}
      </h3>

      {/* Generated image */}
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#B8A17E]/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={generatedUrl}
          alt="Generated photo"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-full border border-[#B8A17E] bg-[#B8A17E]/10 px-6 py-3 text-sm tracking-[0.1em] uppercase text-[#B8A17E] transition-all hover:bg-[#B8A17E]/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {t('photobooth.download') as string}
        </button>

        {canShare && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-full border border-[#2A2520] px-6 py-3 text-sm text-[#B8A99A] transition-all hover:border-[#B8A17E]/30 hover:text-[#B8A17E]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            {t('photobooth.share') as string}
          </button>
        )}

        {!saved ? (
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center justify-center gap-2 rounded-full border border-[#2A2520] px-6 py-3 text-sm text-[#B8A99A] transition-all hover:border-[#B8A17E]/30 hover:text-[#B8A17E]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            {t('photobooth.saveToWall') as string}
          </button>
        ) : (
          <span className="flex items-center justify-center gap-2 px-6 py-3 text-sm text-[#B8A17E]">
            ✓ {t('photobooth.savedSuccess') as string}
          </span>
        )}
      </div>

      {/* Try another / New photo */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {remaining > 0 && (
          <button
            onClick={onTryAnother}
            className="text-sm text-[#B8A99A] hover:text-[#B8A17E] transition-colors"
          >
            {t('photobooth.tryAnother') as string}
          </button>
        )}
        <span className="hidden sm:inline text-[#2A2520]">|</span>
        <button
          onClick={onNewPhoto}
          className="text-sm text-[#B8A99A] hover:text-[#B8A17E] transition-colors"
        >
          {t('photobooth.newPhoto') as string}
        </button>
        <span className="text-xs text-[#B8A99A]/60 ml-2">
          ({t('photobooth.remaining') as string}: {remaining})
        </span>
      </div>

      {/* Save to wall modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className="w-full sm:w-auto sm:min-w-[400px] bg-[#111111] border border-[#2A2520] rounded-t-2xl sm:rounded-2xl p-6"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-[family-name:var(--font-cormorant)] text-lg text-[#F5F0E8] mb-4">
                {t('photobooth.saveModalTitle') as string}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-[#B8A17E]">
                    {t('photobooth.yourName') as string}
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder={locale === 'cs' ? 'Jan Novák' : 'John Doe'}
                    className="w-full rounded-xl border border-[#2A2520] bg-[#1A1A1A] px-4 py-3 text-[#F5F0E8] placeholder-[#4A4540] focus:border-[#B8A17E]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Public/Private toggle */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSavePublic(true)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-center text-sm transition-all ${
                      savePublic
                        ? 'border-[#B8A17E] bg-[#B8A17E]/10 text-[#B8A17E]'
                        : 'border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/30'
                    }`}
                  >
                    🌐 {t('photobooth.public') as string}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSavePublic(false)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-center text-sm transition-all ${
                      !savePublic
                        ? 'border-[#B8A17E] bg-[#B8A17E]/10 text-[#B8A17E]'
                        : 'border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/30'
                    }`}
                  >
                    🔒 {t('photobooth.private') as string}
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!saveName.trim() || saving}
                  className="w-full rounded-full border border-[#B8A17E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#B8A17E] transition-all duration-500 hover:bg-[#B8A17E]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {saving
                    ? (locale === 'cs' ? 'Ukládám...' : 'Saving...')
                    : (t('photobooth.saveBtn') as string)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
