'use client';

import { useI18n } from '@/lib/i18n';
import SectionHeader from '@/components/ui/SectionHeader';
import UploadedPhotosGallery from '@/components/sections/wedding-photos/UploadedPhotosGallery';

export default function WeddingPhotos() {
  const { t, locale } = useI18n();

  const steps =
    locale === 'cs'
      ? [
          {
            step: '1',
            title: 'Otevřete galerii',
            desc: 'Stačí zadat svatební kód',
          },
          {
            step: '2',
            title: 'Prohlížejte a stahujte',
            desc: 'Fotky od fotografa, video i fotky od hostů',
          },
          {
            step: '3',
            title: 'Přidejte své',
            desc: 'Fotky i videa z telefonu, klidně stovky najednou',
          },
        ]
      : [
          {
            step: '1',
            title: 'Open the gallery',
            desc: 'Just enter the wedding code',
          },
          {
            step: '2',
            title: 'Browse & download',
            desc: 'Photographer’s photos, the film and guests’ shots',
          },
          {
            step: '3',
            title: 'Add yours',
            desc: 'Photos and videos from your phone, hundreds at once',
          },
        ];

  return (
    <section id="wedding-photos" className="relative pt-0 pb-8 bg-[#141414]">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          title={t('weddingPhotos.title') as string}
          subtitle={t('weddingPhotos.subtitle') as string}
        />

        <div className="text-center mb-10">
          <p className="text-base md:text-lg text-[#B8A99A] leading-relaxed max-w-2xl mx-auto mb-8">
            {t('weddingPhotos.intro') as string}
          </p>
          <a
            href="/fotky"
            className="inline-flex items-center gap-2 rounded-full bg-[#d8b28c] px-8 py-4 text-sm tracking-[0.15em] uppercase text-[#0A0A0A] font-medium transition-all duration-500 hover:bg-[#e6c4a2]"
          >
            📸 {t('weddingPhotos.open') as string}
          </a>
        </div>

        <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 rounded-xl border border-[#2A2520] bg-[#111111] p-5"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#d8b28c]/30 text-xs text-[#d8b28c] font-semibold">
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

        <UploadedPhotosGallery locale={locale} />
      </div>
    </section>
  );
}
