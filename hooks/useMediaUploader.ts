'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { GuestIdentity } from '@/lib/guest-identity';
import { MediaUploader, getDeviceToken, type UploadSnapshot } from '@/lib/media/uploader';

const EMPTY: UploadSnapshot = {
  jobs: [],
  totalBytes: 0,
  loadedBytes: 0,
  totalCount: 0,
  doneCount: 0,
  skippedCount: 0,
  failedCount: 0,
  active: false,
  offline: false,
  bytesPerSecond: 0,
};

/**
 * Nahrávání do galerie + ochrana před přerušením: dokud se nahrává, drží
 * displej rozsvícený (Wake Lock API) a varuje před zavřením stránky.
 */
export function useMediaUploader(identity: GuestIdentity | null, onFileFinished: () => void) {
  const [uploader] = useState(() =>
    typeof window === 'undefined' ? null : new MediaUploader(getDeviceToken()),
  );
  useEffect(() => {
    uploader?.configure(identity, onFileFinished);
  }, [uploader, identity, onFileFinished]);
  useEffect(() => () => uploader?.dispose(), [uploader]);

  const snapshot = useSyncExternalStore(
    uploader?.subscribe ?? (() => () => {}),
    uploader?.getSnapshot ?? (() => EMPTY),
    () => EMPTY,
  );

  const active = snapshot.active;

  useEffect(() => {
    if (!active) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen');
          if (cancelled) void lock.release();
        }
      } catch {
        // nepodporováno nebo odepřeno — nahrávání poběží i tak
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      cancelled = true;
      void lock?.release().catch(() => {});
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [active]);

  return { uploader, snapshot };
}
