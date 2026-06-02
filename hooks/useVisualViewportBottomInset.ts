'use client';

import { useEffect, useState } from 'react';

/** Extra bottom padding when mobile browser chrome (e.g. Safari URL bar) covers the layout. */
export function useVisualViewportBottomInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setInset(0);
        return;
      }
      const bottom = window.innerHeight - vv.offsetTop - vv.height;
      setInset(Math.max(0, Math.round(bottom)));
    };

    update();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return inset;
}
