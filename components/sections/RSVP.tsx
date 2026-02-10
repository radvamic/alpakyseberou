'use client';

import { useState } from 'react';
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
    allergies: '',
    songRequest: '',
    songNever: '',
  });

  const menuOptions = t('rsvp.menuOptions') as unknown as string[];

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fireConfetti = () => {
    const colors = ['#C9A96E', '#D4AF37', '#E8D5B5', '#F5F0E8'];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);
  };

  const handleSubmit = async () => {
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, attending }),
      });
    } catch {
      // Continue even if API fails
    }
    setSubmitted(true);
    if (attending) fireConfetti();
  };

  const totalSteps = attending ? 3 : 1;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -200 : 200,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(1);

  const nextStep = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  if (submitted) {
    return (
      <section id="rsvp" className="relative py-24 md:py-32 bg-[#141414]">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">{attending ? '🎉' : '💛'}</div>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#F5F0E8] mb-4">
              {attending ? (t('rsvp.successYes') as string) : (t('rsvp.successNo') as string)}
            </h3>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="relative py-24 md:py-32 bg-[#141414]">
      <div className="mx-auto max-w-2xl px-6">
        <SectionHeader
          title={t('rsvp.title') as string}
          subtitle={t('rsvp.subtitle') as string}
        />

        {/* Progress indicator */}
        {attending && (
          <div className="mb-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i + 1 <= step ? 'w-8 bg-[#C9A96E]' : 'w-4 bg-[#2A2520]'
                }`}
              />
            ))}
            <span className="ml-3 text-xs text-[#B8A99A]">
              {t('rsvp.step') as string} {step} {t('rsvp.of') as string} {totalSteps}
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-[#2A2520] bg-[#0A0A0A]/60 p-6 md:p-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Name */}
                <div>
                  <label className="block mb-2 text-sm text-[#E8D5B5]">
                    {t('rsvp.name') as string}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Jan Novák"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm text-[#E8D5B5]">
                    {t('rsvp.email') as string}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="jan@email.cz"
                  />
                </div>

                {/* Attendance */}
                <div>
                  <label className="block mb-3 text-sm text-[#E8D5B5]">
                    {t('rsvp.attendance') as string}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      className={`flex-1 rounded-xl border px-6 py-4 text-sm transition-all duration-300 ${
                        attending === true
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
                      }`}
                    >
                      {t('rsvp.attending') as string}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttending(false)}
                      className={`flex-1 rounded-xl border px-6 py-4 text-sm transition-all duration-300 ${
                        attending === false
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
                      }`}
                    >
                      {t('rsvp.notAttending') as string}
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end pt-4">
                  {attending === false ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.name}
                      className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {t('rsvp.submit') as string}
                    </button>
                  ) : attending === true ? (
                    <button
                      onClick={nextStep}
                      disabled={!formData.name}
                      className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {t('rsvp.next') as string}
                    </button>
                  ) : null}
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
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Guest count */}
                  <div>
                    <label className="block mb-2 text-sm text-[#E8D5B5]">
                      {t('rsvp.guestCount') as string}
                    </label>
                    <select
                      value={formData.guests}
                      onChange={(e) => updateField('guests', e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Menu */}
                  <div>
                    <label className="block mb-2 text-sm text-[#E8D5B5]">
                      {t('rsvp.menu') as string}
                    </label>
                    <select
                      value={formData.menuPreference}
                      onChange={(e) => updateField('menuPreference', e.target.value)}
                    >
                      <option value="">--</option>
                      {menuOptions.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block mb-3 text-sm text-[#E8D5B5]">
                    {t('rsvp.children') as string}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('children', true)}
                      className={`rounded-xl border px-6 py-3 text-sm transition-all duration-300 ${
                        formData.children
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
                      }`}
                    >
                      {t('rsvp.yes') as string}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('children', false)}
                      className={`rounded-xl border px-6 py-3 text-sm transition-all duration-300 ${
                        !formData.children
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                          : 'border-[#2A2520] text-[#B8A99A] hover:border-[#C9A96E]/30'
                      }`}
                    >
                      {t('rsvp.no') as string}
                    </button>
                  </div>
                </div>

                {formData.children && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block mb-2 text-sm text-[#E8D5B5]">
                      {t('rsvp.childrenCount') as string}
                    </label>
                    <select
                      value={formData.childrenCount}
                      onChange={(e) => updateField('childrenCount', e.target.value)}
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={prevStep}
                    className="text-sm text-[#B8A99A] hover:text-[#C9A96E] transition-colors"
                  >
                    {t('rsvp.back') as string}
                  </button>
                  <button
                    onClick={nextStep}
                    className="rounded-full border border-[#C9A96E] px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/10"
                  >
                    {t('rsvp.next') as string}
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
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Allergies */}
                <div>
                  <label className="block mb-2 text-sm text-[#E8D5B5]">
                    {t('rsvp.allergies') as string}
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => updateField('allergies', e.target.value)}
                    placeholder="Bez lepku, laktózy..."
                  />
                </div>

                {/* Song request */}
                <div>
                  <label className="block mb-2 text-sm text-[#E8D5B5]">
                    {t('rsvp.songRequest') as string}
                  </label>
                  <input
                    type="text"
                    value={formData.songRequest}
                    onChange={(e) => updateField('songRequest', e.target.value)}
                    placeholder="Your favorite song..."
                  />
                </div>

                {/* Song never */}
                <div>
                  <label className="block mb-2 text-sm text-[#E8D5B5]">
                    {t('rsvp.songNever') as string}
                  </label>
                  <input
                    type="text"
                    value={formData.songNever}
                    onChange={(e) => updateField('songNever', e.target.value)}
                    placeholder="Please not this one..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={prevStep}
                    className="text-sm text-[#B8A99A] hover:text-[#C9A96E] transition-colors"
                  >
                    {t('rsvp.back') as string}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="rounded-full border border-[#C9A96E] bg-[#C9A96E]/10 px-8 py-3 text-sm tracking-[0.15em] uppercase text-[#C9A96E] transition-all duration-500 hover:bg-[#C9A96E]/20"
                  >
                    {t('rsvp.submit') as string}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
