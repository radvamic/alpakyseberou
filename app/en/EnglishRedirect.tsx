'use client';

import { useEffect } from 'react';
import { writeSiteLang } from '@/lib/site-lang';

export default function EnglishRedirect() {
  useEffect(() => {
    writeSiteLang('en');
    window.location.replace('/');
  }, []);

  return null;
}
