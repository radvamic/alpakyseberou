'use client';

import { useParams } from 'next/navigation';
import QuizPrintSheet from '@/components/quiz/QuizPrintSheet';

/** Tisk všech QR kódů z neveřejné stránky organizátorů. */
export default function KvizOrganizerPrintPage() {
  const { key } = useParams<{ key: string }>();
  return (
    <QuizPrintSheet
      organizerKey={key}
      backHref={`/kviz/organizatori/${key}/otazky`}
      backLabel="← Správa otázek"
    />
  );
}
