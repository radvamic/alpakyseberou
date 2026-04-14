'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import StepUpload from './StepUpload';
import StepCouplePhotos from './StepCouplePhotos';
import StepCategory from './StepCategory';
import StepMotif from './StepMotif';
import StepGenerating from './StepGenerating';
import StepResult from './StepResult';
import type { MotifCategory } from './motifs';

export type WizardStep = 'upload' | 'couple' | 'category' | 'motif' | 'generating' | 'result';

const STEP_ORDER: WizardStep[] = ['upload', 'couple', 'category', 'motif', 'generating', 'result'];

function getStepIndex(step: WizardStep) {
  return STEP_ORDER.indexOf(step);
}

const progressSteps = ['upload', 'couple', 'category', 'motif'] as const;

export default function PhotoBoothWizard() {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<WizardStep>('upload');
  const [direction, setDirection] = useState(1);

  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string>('');
  const [selectedCouplePhotos, setSelectedCouplePhotos] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MotifCategory | null>(null);
  const [selectedMotifId, setSelectedMotifId] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [remaining, setRemaining] = useState<number>(5);
  const [error, setError] = useState<string>('');

  const goTo = useCallback((target: WizardStep) => {
    setDirection(getStepIndex(target) > getStepIndex(step) ? 1 : -1);
    setStep(target);
  }, [step]);

  const handlePhotoSelected = useCallback((file: File, preview: string) => {
    setUserPhoto(file);
    setUserPhotoPreview(preview);
    goTo('couple');
  }, [goTo]);

  const handleCoupleNext = useCallback((photos: string[]) => {
    setSelectedCouplePhotos(photos);
    goTo('category');
  }, [goTo]);

  const handleCategorySelected = useCallback((cat: MotifCategory) => {
    setSelectedCategory(cat);
    goTo('motif');
  }, [goTo]);

  const handleMotifSelected = useCallback((motifId: string) => {
    setSelectedMotifId(motifId);
    goTo('generating');
    doGenerate(motifId);
  }, [goTo, userPhoto, selectedCouplePhotos]);

  const doGenerate = async (motifId: string) => {
    setError('');
    try {
      const formData = new FormData();
      formData.append('userPhoto', userPhoto!);
      formData.append('motifId', motifId);
      if (selectedCouplePhotos.length > 0) {
        formData.append('couplePhotos', JSON.stringify(selectedCouplePhotos));
      }

      const res = await fetch('/api/photobooth/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Něco se nepovedlo');
        goTo('motif');
        return;
      }

      setGeneratedUrl(data.generatedUrl);
      setRemaining(data.remaining ?? 0);
      goTo('result');
    } catch {
      setError('Nepodařilo se spojit se serverem. Zkuste to znovu.');
      goTo('motif');
    }
  };

  const handleTryAnother = useCallback(() => {
    setGeneratedUrl('');
    setSelectedMotifId('');
    setSelectedCategory(null);
    goTo('category');
  }, [goTo]);

  const handleNewPhoto = useCallback(() => {
    setUserPhoto(null);
    setUserPhotoPreview('');
    setSelectedCouplePhotos([]);
    setSelectedCategory(null);
    setSelectedMotifId('');
    setGeneratedUrl('');
    setError('');
    goTo('upload');
  }, [goTo]);

  const handleSavedToWall = useCallback(() => {
    // nothing special needed
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const currentProgressIndex = progressSteps.indexOf(step as typeof progressSteps[number]);
  const showProgress = currentProgressIndex >= 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {progressSteps.map((s, i) => (
        <button
            key={s}
            onClick={() => {
              if (i < currentProgressIndex) goTo(s as WizardStep);
            }}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= currentProgressIndex ? 'w-10 bg-[#C9A96E]' : 'w-5 bg-[#2A2520]'
            } ${i < currentProgressIndex ? 'cursor-pointer hover:bg-[#B8935A]' : 'cursor-default'}`}
          />
                    ))}
          <span className="ml-3 text-xs text-[#B8A99A]">
            {t('photobooth.step') as string} {currentProgressIndex + 1} / {progressSteps.length}
          </span>
        </div>
      )}

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center"
          >
            {error}
            <button
              onClick={() => setError('')}
              className="ml-3 text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="rounded-2xl border border-[#2A2520] bg-[#111111] p-4 sm:p-6 md:p-10 overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'upload' && (
            <motion.div
              key="upload"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepUpload onPhotoSelected={handlePhotoSelected} />
            </motion.div>
          )}

          {step === 'couple' && (
            <motion.div
              key="couple"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepCouplePhotos
                userPhotoPreview={userPhotoPreview}
                selectedPhotos={selectedCouplePhotos}
                onNext={handleCoupleNext}
                onBack={() => goTo('upload')}
              />
            </motion.div>
          )}

          {step === 'category' && (
            <motion.div
              key="category"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepCategory
                onSelect={handleCategorySelected}
                onBack={() => goTo('couple')}
              />
            </motion.div>
          )}

          {step === 'motif' && selectedCategory && (
            <motion.div
              key="motif"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepMotif
                category={selectedCategory}
                onSelect={handleMotifSelected}
                onBack={() => goTo('category')}
              />
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepGenerating locale={locale} />
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              <StepResult
                generatedUrl={generatedUrl}
                category={selectedCategory || 'style'}
                motifId={selectedMotifId}
                remaining={remaining}
                onTryAnother={handleTryAnother}
                onNewPhoto={handleNewPhoto}
                onSaved={handleSavedToWall}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
