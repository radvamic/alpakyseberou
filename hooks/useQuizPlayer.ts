'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { GUEST_IDENTITY_STORAGE_KEY, type GuestIdentity } from '@/lib/guest-identity';
import type { QuizLang, QuizPlayerState } from '@/lib/quiz-types';

const TOKEN_KEY = 'quiz-player-token';
const LANG_KEY = 'quiz-lang';

// localStorage může v soukromém režimu nebo ve vestavěném prohlížeči
// QR čtečky vyhazovat — kvíz pak jen zapomene hráče při zavření.
function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // viz výše
  }
}

function storageRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // viz výše
  }
}

// Jazyk žije v localStorage (sdílený mezi stanovišti i záložkami). Když
// localStorage nefunguje, drží se aspoň v paměti do zavření stránky.
const LANG_EVENT = 'quiz-lang-change';
let fallbackLang: QuizLang = 'cs';

function readLang(): QuizLang {
  return (storageGet(LANG_KEY) ?? fallbackLang) === 'en' ? 'en' : 'cs';
}

function subscribeLang(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

/** Jazyk kvízu — pamatuje si ho napříč naskenovanými stanovišti. */
export function useQuizLang() {
  const lang = useSyncExternalStore(subscribeLang, readLang, (): QuizLang => 'cs');

  const toggleLang = useCallback(() => {
    fallbackLang = readLang() === 'cs' ? 'en' : 'cs';
    storageSet(LANG_KEY, fallbackLang);
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  return { lang, toggleLang };
}

export type QuizPlayerStatus = 'loading' | 'anonymous' | 'ready';

async function fetchPlayer(token: string): Promise<QuizPlayerState | null> {
  const res = await fetch(`/api/quiz/player?token=${encodeURIComponent(token)}`);
  if (res.status === 404) {
    // hráče mezitím smazal admin
    storageRemove(TOKEN_KEY);
    return null;
  }
  if (!res.ok) throw new Error('Player fetch failed');
  return res.json();
}

/**
 * Přihlášený hráč kvízu. Token je v localStorage, takže host zadává jméno
 * jen jednou a na dalších stanovištích ho kvíz pozná sám.
 */
export function useQuizPlayer() {
  const [status, setStatus] = useState<QuizPlayerStatus>('loading');
  const [player, setPlayer] = useState<QuizPlayerState | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const token = storageGet(TOKEN_KEY);
    let cancelled = false;

    (token ? fetchPlayer(token) : Promise.resolve(null))
      .catch(() => null)
      .then((data) => {
        if (cancelled) return;
        setPlayer(data);
        setStatus(data ? 'ready' : 'anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (identity: GuestIdentity) => {
    setRegistering(true);
    try {
      const res = await fetch('/api/quiz/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identity),
      });
      if (!res.ok) throw new Error('Register failed');
      const data: QuizPlayerState = await res.json();
      storageSet(TOKEN_KEY, data.token);
      setPlayer(data);
      setStatus('ready');
    } finally {
      setRegistering(false);
    }
  }, []);

  const answer = useCallback(
    async (questionId: number, option: number) => {
      if (!player) throw new Error('Not registered');
      const previous = player.answers[questionId];

      // Optimisticky — výběr se zvýrazní hned, ne až po odpovědi serveru.
      setPlayer((p) => p && { ...p, answers: { ...p.answers, [questionId]: option } });

      try {
        const res = await fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: player.token, questionId, option }),
        });
        if (!res.ok) throw new Error('Answer failed');
        setPlayer(await res.json());
      } catch (error) {
        setPlayer((p) => {
          if (!p) return p;
          const answers = { ...p.answers };
          if (previous === undefined) delete answers[questionId];
          else answers[questionId] = previous;
          return { ...p, answers };
        });
        throw error;
      }
    },
    [player],
  );

  /** Pro sdílený telefon — další host zadá své jméno. */
  const logout = useCallback(() => {
    storageRemove(TOKEN_KEY);
    storageRemove(GUEST_IDENTITY_STORAGE_KEY);
    setPlayer(null);
    setStatus('anonymous');
  }, []);

  return { status, player, registering, register, answer, logout };
}
