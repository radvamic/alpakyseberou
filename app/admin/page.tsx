'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Rsvp {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  children: boolean;
  childrenCount: number;
  menuPreference: string;
  stayDuration: string;
  allergies: string;
  songRequest: string;
  songNever: string;
  createdAt: string;
}

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  photos: string[];
  isPublic: boolean;
  createdAt: string;
}

interface PhotoboothPhoto {
  id: number;
  userName: string;
  originalPhotoUrl: string;
  generatedPhotoUrl: string;
  category: string;
  motifId: string;
  isPublic: boolean;
  createdAt: string;
}

interface CameraPhoto {
  id: number;
  sessionId: number;
  url: string;
  createdAt: string;
}

interface CameraSession {
  id: number;
  token: string;
  guestName: string;
  photosTaken: number;
  maxPhotos: number;
  createdAt: string;
  photos: CameraPhoto[];
}

interface TableChallengePhoto {
  id: number;
  name: string;
  url: string;
  createdAt: string;
}

interface TableChallengeGuest {
  name: string;
  photos: TableChallengePhoto[];
}

interface TableChallengeStats {
  totalPhotos: number;
  uniqueParticipants: number;
  withProof: number;
  avgPhotosPerGuest: number;
}

type Tab = 'rsvp' | 'guestbook' | 'photobooth' | 'camera' | 'table-challenge';
type GuestbookFilter = 'all' | 'public' | 'private';

const STAY_LABELS: Record<string, string> = {
  fri_sat: 'Pá + So',
  fri_only: 'Pouze pátek',
  sat_only: 'Pouze sobota',
  ceremony_only: 'Jen obřad',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="relative border border-[#C9A96E]/15 px-6 py-5">
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/40" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/40" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/40" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/40" />
      <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-1">{label}</p>
      <p className="font-[family-name:var(--font-playfair)] text-3xl text-[#C9A96E]">{value}</p>
      {sub && <p className="text-xs text-[#5a5248] mt-1">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('rsvp');
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [photobooth, setPhotobooth] = useState<PhotoboothPhoto[]>([]);
  const [cameraSessions, setCameraSessions] = useState<CameraSession[]>([]);
  const [tableChallengeGuests, setTableChallengeGuests] = useState<TableChallengeGuest[]>([]);
  const [tableChallengeStats, setTableChallengeStats] = useState<TableChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestbookFilter, setGuestbookFilter] = useState<GuestbookFilter>('all');
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [expandedTableGuest, setExpandedTableGuest] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, g, p, c, tc] = await Promise.all([
        fetch('/api/rsvp').then((x) => x.json()),
        fetch('/api/guestbook').then((x) => x.json()),
        fetch('/api/admin/photobooth').then((x) => x.json()),
        fetch('/api/admin/camera').then((x) => x.json()),
        fetch('/api/admin/table-challenge').then((x) => x.json()),
      ]);
      setRsvps(Array.isArray(r) ? r : []);
      setGuestbook(Array.isArray(g) ? g : []);
      setPhotobooth(Array.isArray(p) ? p : []);
      setCameraSessions(Array.isArray(c) ? c : []);
      if (tc && !tc.error) {
        setTableChallengeGuests(Array.isArray(tc.guests) ? tc.guests : []);
        setTableChallengeStats(tc.stats ?? null);
      } else {
        setTableChallengeGuests([]);
        setTableChallengeStats(null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const [emailTest, setEmailTest] = useState<{ ok: boolean; error?: string; config?: Record<string, string> } | null>(null);
  const [emailTesting, setEmailTesting] = useState(false);

  const testEmail = async () => {
    setEmailTesting(true);
    setEmailTest(null);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      setEmailTest(data);
    } catch {
      setEmailTest({ ok: false, error: 'Nepodařilo se kontaktovat server' });
    } finally {
      setEmailTesting(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  // Stats
  const attending = rsvps.filter((r) => r.attending);
  const notAttending = rsvps.filter((r) => !r.attending);
  const totalGuests = attending.reduce((acc, r) => acc + (r.guests || 1), 0);
  const menuCounts = attending.reduce<Record<string, number>>((acc, r) => {
    const key = r.menuPreference || 'Neuvedeno';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const stayCounts = attending.reduce<Record<string, number>>((acc, r) => {
    const key = r.stayDuration || '';
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredGuestbook =
    guestbookFilter === 'all'
      ? guestbook
      : guestbookFilter === 'public'
      ? guestbook.filter((g) => g.isPublic)
      : guestbook.filter((g) => !g.isPublic);

  const totalCameraPhotos = cameraSessions.reduce((acc, s) => acc + s.photosTaken, 0);
  const totalTablePhotos = tableChallengeStats?.totalPhotos ?? 0;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'rsvp', label: 'Účast', count: rsvps.length },
    { id: 'guestbook', label: 'Nástěnka', count: guestbook.length },
    { id: 'photobooth', label: 'Fotokoutek', count: photobooth.length },
    { id: 'camera', label: 'Kamera', count: totalCameraPhotos },
    { id: 'table-challenge', label: 'Úkoly', count: totalTablePhotos },
  ];

  const siteBase = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz';
  const ukolyUrl = `${siteBase}/ukoly`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="h-[1px] w-10 bg-gradient-to-r from-[#C9A96E] to-transparent mb-3" />
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-light text-[#F5F0E8]">
            Administrace
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-[#7a6e65] text-sm tracking-widest uppercase mt-1">
            Klára & Michal 2026
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={testEmail}
            disabled={emailTesting}
            className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] hover:text-[#C9A96E] transition-colors disabled:opacity-40"
          >
            {emailTesting ? '⏳ Testuji…' : '✉ Test emailu'}
          </button>
          <button
            onClick={load}
            className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] hover:text-[#C9A96E] transition-colors"
          >
            ↺ Obnovit
          </button>
          <button
            onClick={logout}
            className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] hover:text-red-400 transition-colors"
          >
            Odhlásit
          </button>
        </div>
      </div>

      {/* Email test result */}
      {emailTest && (
        <div className={`mb-6 px-5 py-4 border text-sm font-[family-name:var(--font-cormorant)] ${emailTest.ok ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-red-500/30 bg-red-500/5 text-red-400'}`}>
          {emailTest.ok ? (
            <p>✅ Email odeslán! Zkontroluj schránku.</p>
          ) : (
            <>
              <p className="mb-2">❌ Chyba: {emailTest.error}</p>
              {emailTest.config && (
                <div className="mt-2 text-xs text-[#5a5248] space-y-0.5">
                  {Object.entries(emailTest.config).map(([k, v]) => (
                    <p key={k}><span className="text-[#7a6e65]">{k}:</span> {v}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[#2A2520]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm tracking-[0.1em] uppercase transition-all duration-300 border-b-2 -mb-px ${
              tab === t.id
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-[#7a6e65] hover:text-[#B8A99A]'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-sm ${tab === t.id ? 'bg-[#C9A96E]/20 text-[#C9A96E]' : 'bg-[#1a1a1a] text-[#5a5248]'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="font-[family-name:var(--font-cormorant)] text-[#5a5248] text-sm tracking-widest uppercase">
            Načítám…
          </p>
        </div>
      ) : (
        <>
          {/* ================================================================
              RSVP TAB
          ================================================================ */}
          {tab === 'rsvp' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Potvrzeno" value={attending.length} sub={`z ${rsvps.length} odpovědí`} />
                <StatCard label="Celkem hostů" value={totalGuests} sub="osoby bez dětí" />
                <StatCard label="Nepřijede" value={notAttending.length} />
                <StatCard label="S dětmi" value={attending.filter((r) => r.children).length} />
              </div>

              {/* Menu breakdown */}
              {Object.keys(menuCounts).length > 0 && (
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">Preference menu</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(menuCounts).map(([key, count]) => (
                      <span key={key} className="text-xs px-3 py-1.5 border border-[#2A2520] text-[#B8A99A]">
                        {key} <span className="text-[#C9A96E] ml-1">{count}×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stay breakdown */}
              {Object.keys(stayCounts).length > 0 && (
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-3">Délka pobytu</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stayCounts).map(([key, count]) => (
                      <span key={key} className="text-xs px-3 py-1.5 border border-[#2A2520] text-[#B8A99A]">
                        {STAY_LABELS[key] || key} <span className="text-[#C9A96E] ml-1">{count}×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Table */}
              {rsvps.length === 0 ? (
                <p className="text-center py-16 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
                  Zatím žádné odpovědi.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2520]">
                        {['Jméno', 'E-mail', 'Účast', 'Hostů', 'Menu', 'Pobyt', 'Děti', 'Alergie', 'Písnička ✓', 'Písnička ✗', 'Datum'].map((h) => (
                          <th key={h} className="text-left py-3 px-3 text-xs tracking-[0.15em] uppercase text-[#5a5248] font-normal whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.map((r) => (
                        <tr key={r.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                          <td className="py-3 px-3 text-[#F5F0E8] whitespace-nowrap">{r.name}</td>
                          <td className="py-3 px-3 text-[#7a6e65] whitespace-nowrap">{r.email || '—'}</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 ${r.attending ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                              {r.attending ? 'Ano' : 'Ne'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#B8A99A] text-center">{r.attending ? r.guests : '—'}</td>
                          <td className="py-3 px-3 text-[#B8A99A] whitespace-nowrap">{r.menuPreference || '—'}</td>
                          <td className="py-3 px-3 text-[#B8A99A] whitespace-nowrap">
                            {r.stayDuration ? (STAY_LABELS[r.stayDuration] || r.stayDuration) : '—'}
                          </td>
                          <td className="py-3 px-3 text-[#B8A99A] text-center">
                            {r.attending ? (r.children ? `Ano (${r.childrenCount || '?'})` : 'Ne') : '—'}
                          </td>
                          <td className="py-3 px-3 text-[#7a6e65]">{r.allergies || '—'}</td>
                          <td className="py-3 px-3 text-[#7a6e65]">{r.songRequest || '—'}</td>
                          <td className="py-3 px-3 text-[#7a6e65]">{r.songNever || '—'}</td>
                          <td className="py-3 px-3 text-[#5a5248] whitespace-nowrap text-xs">{formatDate(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              GUESTBOOK TAB
          ================================================================ */}
          {tab === 'guestbook' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-2">
                {(['all', 'public', 'private'] as GuestbookFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setGuestbookFilter(f)}
                    className={`text-xs px-4 py-2 tracking-[0.15em] uppercase transition-all duration-300 border-b-2 ${
                      guestbookFilter === f
                        ? 'border-[#C9A96E] text-[#C9A96E]'
                        : 'border-transparent text-[#7a6e65] hover:text-[#B8A99A]'
                    }`}
                  >
                    {f === 'all' ? 'Vše' : f === 'public' ? 'Veřejné' : 'Soukromé'}
                    <span className={`ml-2 text-xs ${guestbookFilter === f ? 'text-[#C9A96E]' : 'text-[#5a5248]'}`}>
                      ({f === 'all' ? guestbook.length : f === 'public' ? guestbook.filter(g => g.isPublic).length : guestbook.filter(g => !g.isPublic).length})
                    </span>
                  </button>
                ))}
              </div>

              {filteredGuestbook.length === 0 ? (
                <p className="text-center py-16 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
                  Žádné vzkazy v této kategorii.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredGuestbook.map((g) => (
                    <div key={g.id} className="relative border border-[#C9A96E]/10 p-6 hover:border-[#C9A96E]/25 transition-colors">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/30" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/30" />

                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8]">{g.name}</p>
                          <p className="text-xs text-[#5a5248] mt-0.5">{formatDate(g.createdAt)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 shrink-0 ml-2 ${g.isPublic ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                          {g.isPublic ? 'Veřejný' : 'Soukromý'}
                        </span>
                      </div>

                      <p className="font-[family-name:var(--font-cormorant)] text-[#B8A99A] leading-relaxed text-base">
                        {g.message}
                      </p>

                      {g.photos && g.photos.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {g.photos.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt=""
                                className="w-16 h-16 object-cover border border-[#2A2520] hover:border-[#C9A96E]/50 transition-colors"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              PHOTOBOOTH TAB
          ================================================================ */}
          {tab === 'photobooth' && (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="flex gap-4 flex-wrap">
                <span className="text-xs px-3 py-1.5 border border-[#2A2520] text-[#B8A99A]">
                  Celkem <span className="text-[#C9A96E] ml-1">{photobooth.length}</span>
                </span>
                <span className="text-xs px-3 py-1.5 border border-[#2A2520] text-[#B8A99A]">
                  Veřejné <span className="text-[#C9A96E] ml-1">{photobooth.filter(p => p.isPublic).length}</span>
                </span>
                <span className="text-xs px-3 py-1.5 border border-[#2A2520] text-[#B8A99A]">
                  Soukromé <span className="text-[#C9A96E] ml-1">{photobooth.filter(p => !p.isPublic).length}</span>
                </span>
              </div>

              {photobooth.length === 0 ? (
                <p className="text-center py-16 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
                  Zatím žádné výtvory z fotokouta.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {photobooth.map((p) => (
                    <div key={p.id} className="relative border border-[#C9A96E]/10 p-4 hover:border-[#C9A96E]/25 transition-colors">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/30" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/30" />

                      {/* Generated photo */}
                      <a href={p.generatedPhotoUrl} target="_blank" rel="noreferrer" className="block mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.generatedPhotoUrl}
                          alt={`${p.userName} — ${p.motifId}`}
                          className="w-full aspect-square object-cover border border-[#2A2520]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </a>

                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8] text-sm truncate">
                            {p.userName}
                          </p>
                          <p className="text-xs text-[#5a5248] mt-0.5 truncate">{p.category} / {p.motifId}</p>
                          <p className="text-xs text-[#5a5248] mt-0.5">{formatDate(p.createdAt)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 shrink-0 ml-2 ${p.isPublic ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                          {p.isPublic ? '👁' : '🔒'}
                        </span>
                      </div>

                      {/* Original photo thumbnail */}
                      {p.originalPhotoUrl && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-[#5a5248]">Originál:</span>
                          <a href={p.originalPhotoUrl} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.originalPhotoUrl}
                              alt="originál"
                              className="w-8 h-8 object-cover border border-[#2A2520] hover:border-[#C9A96E]/50 transition-colors"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* ================================================================
              CAMERA TAB
          ================================================================ */}
          {tab === 'camera' && (
            <div className="space-y-8">
              {/* QR + stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR code */}
                <div className="relative border border-[#C9A96E]/15 p-6">
                  <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/40" />
                  <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/40" />
                  <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/40" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/40" />
                  <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-4">QR kód pro hosty</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-[#F5F0E8] rounded">
                      <QRCodeSVG
                        value={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alpakyseberou.cz'}/kamera`}
                        size={140}
                        level="M"
                        bgColor="#F5F0E8"
                        fgColor="#0A0A0A"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8] mb-1">
                        alpakyseberou.cz/kamera
                      </p>
                      <p className="text-xs text-[#5a5248]">
                        Hosté naskenují kód a fotí přímo ze svého telefonu.
                      </p>
                      <a
                        href="/kamera"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-xs text-[#C9A96E] underline underline-offset-2"
                      >
                        Otevřít stránku →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 content-start">
                  <StatCard label="Hosté s kamerou" value={cameraSessions.length} />
                  <StatCard label="Celkem fotek" value={totalCameraPhotos} />
                  <StatCard
                    label="Průměr / host"
                    value={cameraSessions.length > 0 ? (totalCameraPhotos / cameraSessions.length).toFixed(1) : '0'}
                  />
                  <StatCard
                    label="Plné filmy"
                    value={cameraSessions.filter((s) => s.photosTaken >= s.maxPhotos).length}
                  />
                </div>
              </div>

              {cameraSessions.length === 0 ? (
                <p className="text-center py-16 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
                  Zatím nikdo nevyfotil žádnou fotku.
                </p>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#C9A96E]">Hosté</h3>
                  {cameraSessions.map((s) => (
                    <div key={s.id} className="relative border border-[#C9A96E]/10 hover:border-[#C9A96E]/25 transition-colors">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/30" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/30" />

                      {/* Session header */}
                      <button
                        onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-[family-name:var(--font-playfair)] text-[#F5F0E8]">
                            {s.guestName}
                          </span>
                          <span className="text-xs text-[#5a5248]">{formatDate(s.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Film strip mini */}
                          <div className="hidden sm:flex gap-[2px]">
                            {Array.from({ length: s.maxPhotos }).map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: i < s.photosTaken ? '#C9A96E' : '#2A2520' }}
                              />
                            ))}
                          </div>
                          <span className={`text-xs px-2 py-1 ${s.photosTaken >= s.maxPhotos ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                            {s.photosTaken} / {s.maxPhotos}
                          </span>
                          <span className="text-[#5a5248] text-xs ml-1">
                            {expandedSession === s.id ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {/* Photos grid */}
                      {expandedSession === s.id && s.photos.length > 0 && (
                        <div className="px-5 pb-5">
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {s.photos.map((photo) => (
                              <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full aspect-square object-cover border border-[#2A2520] hover:border-[#C9A96E]/50 transition-colors"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {expandedSession === s.id && s.photos.length === 0 && (
                        <p className="px-5 pb-5 text-xs text-[#5a5248] italic">Žádné fotky.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              TABLE CHALLENGE TAB
          ================================================================ */}
          {tab === 'table-challenge' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative border border-[#C9A96E]/15 p-6">
                  <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/40" />
                  <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/40" />
                  <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/40" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/40" />
                  <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-4">
                    QR kód pro stoly
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-[#F5F0E8] rounded">
                      <QRCodeSVG
                        value={ukolyUrl}
                        size={140}
                        level="M"
                        bgColor="#F5F0E8"
                        fgColor="#0A0A0A"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8] mb-1">
                        /ukoly
                      </p>
                      <p className="text-xs text-[#5a5248]">
                        Hosté losují úkoly a mohou nahrát fotodůkaz.
                      </p>
                      <a
                        href="/ukoly"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-xs text-[#C9A96E] underline underline-offset-2"
                      >
                        Otevřít stránku →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 content-start">
                  <StatCard
                    label="Fotodůkazů"
                    value={tableChallengeStats?.totalPhotos ?? 0}
                  />
                  <StatCard
                    label="Účastníků"
                    value={tableChallengeStats?.uniqueParticipants ?? 0}
                    sub="unikátní jména u fotek"
                  />
                  <StatCard
                    label="Průměr fotek"
                    value={tableChallengeStats?.avgPhotosPerGuest ?? 0}
                    sub="na účastníka"
                  />
                  <StatCard
                    label="S alespoň 1 fotkou"
                    value={tableChallengeStats?.withProof ?? 0}
                  />
                </div>
              </div>

              <p className="text-xs text-[#5a5248] font-[family-name:var(--font-cormorant)] italic">
                Počet účastníků = kolik různých jmen nahrálo fotodůkaz. Samotné losování úkolů se neukládá.
              </p>

              {tableChallengeGuests.length === 0 ? (
                <p className="text-center py-16 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
                  Zatím žádné fotodůkazy z table challenge.
                </p>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#C9A96E]">
                    Fotodůkazy podle hosta
                  </h3>
                  {tableChallengeGuests.map((g) => (
                    <div
                      key={g.name}
                      className="relative border border-[#C9A96E]/10 hover:border-[#C9A96E]/25 transition-colors"
                    >
                      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C9A96E]/30" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C9A96E]/30" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C9A96E]/30" />

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTableGuest(
                            expandedTableGuest === g.name ? null : g.name,
                          )
                        }
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="font-[family-name:var(--font-playfair)] text-[#F5F0E8]">
                          {g.name}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs px-2 py-1 text-emerald-400 bg-emerald-400/10">
                            {g.photos.length}{' '}
                            {g.photos.length === 1 ? 'fotka' : g.photos.length < 5 ? 'fotky' : 'fotek'}
                          </span>
                          <span className="text-[#5a5248] text-xs">
                            {expandedTableGuest === g.name ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {expandedTableGuest === g.name && (
                        <div className="px-5 pb-5">
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {g.photos.map((photo) => (
                              <a
                                key={photo.id}
                                href={photo.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.url}
                                  alt=""
                                  className="w-full aspect-square object-cover border border-[#2A2520] hover:border-[#C9A96E]/50 transition-colors"
                                />
                              </a>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-[#5a5248]">
                            Poslední: {formatDate(g.photos[0].createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tableChallengeGuests.length > 0 && (
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
                    Všechny fotky (nejnovější)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {tableChallengeGuests.flatMap((g) => g.photos).map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full aspect-square object-cover border border-[#2A2520] group-hover:border-[#C9A96E]/50 transition-colors"
                        />
                        <p className="text-[10px] text-[#5a5248] mt-1 truncate">
                          {photo.name}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
