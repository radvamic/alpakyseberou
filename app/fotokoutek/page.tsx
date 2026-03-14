'use client';

import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CustomCursor from '@/components/ui/CustomCursor';
import PhotoBoothWizard from '@/components/photobooth/PhotoBoothWizard';
import PhotoWall from '@/components/photobooth/PhotoWall';
import SectionHeader from '@/components/ui/SectionHeader';
import { useI18n } from '@/lib/i18n';

function PhotoBoothContent() {
  const { t } = useI18n();

  return (
    <>
      <CustomCursor />
      <Navbar />

      <main className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeader
            title={t('photobooth.title') as string}
            subtitle={t('photobooth.subtitle') as string}
          />

          <PhotoBoothWizard />
          <PhotoWall />
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function PhotoBoothPage() {
  return (
    <I18nProvider>
      <PhotoBoothContent />
    </I18nProvider>
  );
}
