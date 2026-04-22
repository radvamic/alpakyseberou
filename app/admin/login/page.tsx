'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Nesprávné heslo');
      }
    } catch {
      setError('Chyba připojení');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-4 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-[#F5F0E8] mb-2">
            Administrace
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-[#7a6e65] text-sm tracking-widest uppercase">
            Klára & Michal 2026
          </p>
          <div className="mt-4 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative border border-[#C9A96E]/15 px-8 py-10">
            <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#C9A96E]/50" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#C9A96E]/50" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#C9A96E]/50" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#C9A96E]/50" />

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-xs tracking-[0.2em] uppercase text-[#C9A96E]">
                  Heslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rsvp-input"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-[family-name:var(--font-cormorant)] italic">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="rsvp-btn w-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Přihlašuji…' : 'Vstoupit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
