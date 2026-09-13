'use client';

import QuizPrintSheet from '@/components/quiz/QuizPrintSheet';

/** Tisk QR kódů z administrace (chráněno middlewarem). */
export default function KvizTiskPage() {
  return <QuizPrintSheet backHref="/admin" backLabel="← Administrace" />;
}
