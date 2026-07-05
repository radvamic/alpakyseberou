'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import confetti from 'canvas-confetti';

export default function RSVP() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    guests: '1',
    menuPreference: '',
    children: false,
    childrenCount: '0',
    childrenUnder6: '0',
    childrenOver6: '0',
    allergies: '',
    songRequest: '',
    songNever: '',
    stayDuration: '',
  });

  const menuOptions = ((t('rsvp.menuOptions') as unknown as string[]) ?? []).filter(
    (opt) => !/^(ryba|fish)$/i.test(opt),
  );
  const stayDurationOptions = t('rsvp.stayDurationOptions') as unknown as { value: string; label: string }[];

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fireConfetti = () => {
    const colors = ['#B8A17E', '#E5D5CA', '#C8AF93', '#F5F0E8'];
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors });
    }, 250);
  };

  const handleSubmit = async (isAttending?: boolean) => {
    const finalAttending = isAttending ?? attending;
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, attending: finalAttending }),
      });
    } catch {
      // Continue even if API fails
    }
    setSubmitted(true);
    if (finalAttending) fireConfetti();
  };

  const totalSteps = attending ? 3 : 1;
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const nextStep = () => { setDirection(1); setStep((s) => Math.min(s + 1, totalSteps)); };
  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  if (submitted) {
    return (
      <section id="rsvp" className="relative pt-4 pb-24 md:pt-6 md:pb-32 bg-[#0A0A0A]">
        <div className="mx-auto max-w-xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {attending ? (
              <>
                <div className="mb-6 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#B8A17E] to-transparent" />
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[#F5F0E8] font-light mb-4">
                  {t('rsvp.successYes') as string}
                </h3>
                <p className="text-[#B8A99A] font-[family-name:var(--font-cormorant)] text-lg">
                  {t('rsvp.successAlpacaSay') as string}
                </p>
                <div className="mt-8 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#B8A17E] to-transparent" />
              </>
            ) : (
              <>
                <div className="mb-6 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#B8A17E] to-transparent" />
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl text-[#F5F0E8] font-light">
                  {t('rsvp.successNo') as string}
                </h3>
                <div className="mt-8 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#B8A17E] to-transparent" />
              </>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="relative pt-4 pb-24 md:pt-6 md:pb-32 bg-[#0A0A0A]">
      <div className="mx-auto max-w-2xl px-6">
        <SectionHeader
          title={t('rsvp.title') as string}
          subtitle={t('rsvp.subtitle') as string}
        />

        {/* Expand toggle */}
        {!expanded && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => {
                setExpanded(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }}
              className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#B8A99A] hover:text-[#B8A17E] transition-colors duration-300"
            >
              <span className="h-px w-10 bg-[#B8A17E]/30 group-hover:bg-[#B8A17E]/60 transition-colors duration-300" />
              {t('rsvp.title') as string}
              <motion.span className="text-[#B8A17E]">↓</motion.span>
              <span className="h-px w-10 bg-[#B8A17E]/30 group-hover:bg-[#B8A17E]/60 transition-colors duration-300" />
            </button>
          </motion.div>
        )}

        <AnimatePresence>
        {expanded && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >

        {/* Step indicator */}
        {attending && (
          <motion.div
            className="mb-12 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all duration-500 ${
                  i + 1 < step
                    ? 'border-[#B8A17E] bg-[#B8A17E] text-[#0A0A0A]'
                    : i + 1 === step
                      ? 'border-[#B8A17E] text-[#B8A17E]'
                      : 'border-[#2A2520] text-[#2A2520]'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-[1px] w-12 transition-all duration-500 ${i + 1 < step ? 'bg-[#B8A17E]' : 'bg-[#2A2520]'}`} />
                )}
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setExpanded(false)}
            className="group flex items-center gap-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-[#5a5248] hover:text-[#B8A17E] transition-colors duration-300"
          >
            <span className="h-px w-10 bg-[#B8A17E]/20 group-hover:bg-[#B8A17E]/50 transition-colors duration-300" />
            {t('rsvp.name') as string === 'Vaše jméno' ? 'Skrýt' : 'Hide'} ↑
            <span className="h-px w-10 bg-[#B8A17E]/20 group-hover:bg-[#B8A17E]/50 transition-colors duration-300" />
          </button>
        </div>

        <div className="relative border border-[#B8A17E]/15 px-8 py-10 md:px-12 md:py-14">
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#B8A17E]/50" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#B8A17E]/50" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#B8A17E]/50" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#B8A17E]/50" />

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              {/* Name */}
              <div className="group">
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.name') as string}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Jan Novák"
                  className="rsvp-input"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.email') as string}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="jan@email.cz"
                  className="rsvp-input"
                />
              </div>

              {/* Attendance — clicking directly triggers action */}
              <div>
                <label className="block mb-4 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.attendance') as string}
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    disabled={!formData.name}
                    onClick={() => { setAttending(true); setDirection(1); setStep(2); }}
                    className="flex-1 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-500 border-b-2 border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/40 hover:text-[#E5D5CA] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('rsvp.attending') as string}
                  </button>
                  <button
                    type="button"
                    disabled={!formData.name}
                    onClick={() => { setAttending(false); handleSubmit(false); }}
                    className="flex-1 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-500 border-b-2 border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/40 hover:text-[#E5D5CA] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('rsvp.notAttending') as string}
                  </button>
                </div>
                {!formData.name && (
                  <p className="mt-3 text-xs text-[#5a5248] italic">
                    {t('rsvp.name') as string === 'Vaše jméno' ? '* vyplňte nejprve jméno' : '* please fill in your name first'}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && attending && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                    {t('rsvp.guestCount') as string}
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => updateField('guests', e.target.value)}
                    className="rsvp-input"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                    {t('rsvp.menu') as string}
                  </label>
                  <select
                    value={formData.menuPreference}
                    onChange={(e) => updateField('menuPreference', e.target.value)}
                    className="rsvp-input"
                  >
                    <option value="">—</option>
                    {menuOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-4 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.children') as string}
                </label>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => updateField('children', val)}
                      className={`px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-500 border-b-2 ${
                        formData.children === val
                          ? 'border-[#B8A17E] text-[#B8A17E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/40'
                      }`}
                    >
                      {val ? t('rsvp.yes') as string : t('rsvp.no') as string}
                    </button>
                  ))}
                </div>
              </div>

              {formData.children && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-10"
                >
                  <div>
                    <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                      {t('rsvp.childrenUnder6') as string}
                    </label>
                    <select
                      value={formData.childrenUnder6}
                      onChange={(e) => updateField('childrenUnder6', e.target.value)}
                      className="rsvp-input"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                      {t('rsvp.childrenOver6') as string}
                    </label>
                    <select
                      value={formData.childrenOver6}
                      onChange={(e) => updateField('childrenOver6', e.target.value)}
                      className="rsvp-input"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.stayDuration') as string}
                </label>
                <div className="mb-6 border-l-2 border-[#B8A17E]/30 pl-5 space-y-2">
                  {(t('rsvp.stayDurationDesc') as string).split('. ').filter(Boolean).map((sentence, i, arr) => (
                    <p key={i} className="text-base text-[#B8A99A] font-[family-name:var(--font-cormorant)] leading-relaxed">
                      {sentence}{i < arr.length - 1 ? '.' : ''}
                    </p>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {stayDurationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('stayDuration', opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm tracking-[0.1em] transition-all duration-500 border-b-2 ${
                        formData.stayDuration === opt.value
                          ? 'border-[#B8A17E] text-[#B8A17E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#B8A17E]/40 hover:text-[#E5D5CA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="rsvp-back">
                  ← {t('rsvp.back') as string}
                </button>
                <button onClick={nextStep} className="rsvp-btn">
                  {t('rsvp.next') as string} →
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && attending && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              <div>
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.allergies') as string}
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                  placeholder="Bez lepku, laktózy…"
                  className="rsvp-input"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.songRequest') as string}
                </label>
                <input
                  type="text"
                  value={formData.songRequest}
                  onChange={(e) => updateField('songRequest', e.target.value)}
                  placeholder="Váš oblíbený song…"
                  className="rsvp-input"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#B8A17E]">
                  {t('rsvp.songNever') as string}
                </label>
                <input
                  type="text"
                  value={formData.songNever}
                  onChange={(e) => updateField('songNever', e.target.value)}
                  placeholder="Jen ne tohle…"
                  className="rsvp-input"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="rsvp-back">
                  ← {t('rsvp.back') as string}
                </button>
                <button onClick={() => handleSubmit()} className="rsvp-btn">
                  {t('rsvp.submit') as string}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}
