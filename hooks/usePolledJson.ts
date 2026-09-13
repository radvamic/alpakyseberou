'use client';

import { useEffect, useState } from 'react';

interface PolledState<T> {
  data: T | null;
  error: boolean;
  notFound: boolean;
}

/** Periodicky načítá JSON (stránky pro projektor). Na 404 přestane. */
export function usePolledJson<T>(url: string, intervalMs: number): PolledState<T> {
  const [state, setState] = useState<PolledState<T>>({ data: null, error: false, notFound: false });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 404) {
          clearInterval(interval);
          setState({ data: null, error: false, notFound: true });
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: T = await res.json();
        if (!cancelled) setState({ data, error: false, notFound: false });
      } catch {
        // při výpadku sítě necháme na plátně poslední známá data
        if (!cancelled) setState((s) => ({ ...s, error: true }));
      }
    };

    const interval = setInterval(load, intervalMs);
    load();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [url, intervalMs]);

  return state;
}
