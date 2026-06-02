'use client';

import { useEffect, useState, useCallback } from 'react';
import NameEntry from '@/components/camera/NameEntry';
import CameraShutter from '@/components/camera/CameraShutter';
import FilmFull from '@/components/camera/FilmFull';

type ViewState = 'loading' | 'name-entry' | 'camera' | 'film-full';

interface SessionData {
  token: string;
  guestName: string;
  photosTaken: number;
  maxPhotos: number;
}

const TOKEN_KEY = 'camera-session-token';

export default function KameraPage() {
  const [view, setView] = useState<ViewState>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setView('name-entry');
      return;
    }

    fetch(`/api/camera/session?token=${encodeURIComponent(stored)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SessionData | null) => {
        if (!data) {
          localStorage.removeItem(TOKEN_KEY);
          setView('name-entry');
          return;
        }
        setSession(data);
        setView(data.photosTaken >= data.maxPhotos ? 'film-full' : 'camera');
      })
      .catch(() => {
        setView('name-entry');
      });
  }, []);

  const handleNameSubmit = useCallback(async (name: string) => {
    setNameLoading(true);
    try {
      const res = await fetch('/api/camera/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Server error');
      const data: SessionData = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setSession(data);
      setView(data.photosTaken >= data.maxPhotos ? 'film-full' : 'camera');
    } finally {
      setNameLoading(false);
    }
  }, []);

  const handlePhotoTaken = useCallback(
    async (file: File) => {
      if (!session) return;
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('token', session.token);
      formData.append('photo', file);

      try {
        const res = await fetch('/api/camera/photo', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            // Film is full according to server
            setSession((prev) =>
              prev ? { ...prev, photosTaken: prev.maxPhotos } : prev,
            );
            setView('film-full');
            return;
          }
          throw new Error(data.error || 'Upload failed');
        }

        const newCount: number = data.photosTaken;
        setSession((prev) => (prev ? { ...prev, photosTaken: newCount } : prev));

        if (newCount >= (session.maxPhotos)) {
          setView('film-full');
        }
      } catch {
        setUploadError('Nepodařilo se nahrát fotku. Zkus to znovu.');
      } finally {
        setUploading(false);
      }
    },
    [session],
  );

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C9A96E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (view === 'name-entry') {
    return <NameEntry onSubmit={handleNameSubmit} loading={nameLoading} />;
  }

  if (view === 'film-full' && session) {
    return <FilmFull guestName={session.guestName} photosTaken={session.photosTaken} />;
  }

  if (view === 'camera' && session) {
    return (
      <CameraShutter
        guestName={session.guestName}
        photosTaken={session.photosTaken}
        maxPhotos={session.maxPhotos}
        onPhotoTaken={handlePhotoTaken}
        uploading={uploading}
        uploadError={uploadError}
      />
    );
  }

  return null;
}
