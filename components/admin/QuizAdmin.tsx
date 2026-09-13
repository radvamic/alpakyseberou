'use client';

import { useId, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import StatCard from '@/components/admin/StatCard';
import { Corners } from '@/components/quiz/QuizUi';
import {
  OPTION_LETTERS,
  QUIZ_ORGANIZER_HEADER,
  type QuizAdminData,
  type QuizAdminPlayer,
  type QuizAdminQuestion,
  type QuizOption,
} from '@/lib/quiz-types';

interface QuizAdminProps {
  data: QuizAdminData;
  setData: Dispatch<SetStateAction<QuizAdminData>>;
  siteBase: string;
  /**
   * Správa z neveřejné stránky organizátorů: API se autorizuje klíčem místo
   * admin cookie a chybí správa hráčů i karta s odkazem pro organizátory.
   */
  organizerKey?: string;
}

type QuestionDraft = Omit<QuizAdminQuestion, 'id' | 'number'> & { number: string };

const INPUT =
  'w-full bg-[#141414] border border-[#2A2520] px-3 py-2 text-sm text-[#F5F0E8] placeholder-[#4A4540] focus:outline-none focus:border-[#d8b28c]/60 transition-colors';
const LABEL = 'block text-[10px] tracking-[0.15em] uppercase text-[#7a6e65] mb-1';
const LINK = 'text-xs text-[#d8b28c] underline underline-offset-2';
const SMALL_BUTTON =
  'text-xs tracking-[0.12em] uppercase px-3 py-1.5 border border-[#2A2520] text-[#B8A99A] hover:text-[#d8b28c] hover:border-[#d8b28c]/40 transition-colors';

function toDraft(question: QuizAdminQuestion | undefined, nextNumber: number): QuestionDraft {
  return {
    number: String(question?.number ?? nextNumber),
    imageUrl: question?.imageUrl ?? '',
    questionCs: question?.questionCs ?? '',
    questionEn: question?.questionEn ?? '',
    options: question?.options.map((o) => ({ ...o })) ?? [
      { cs: '', en: '' },
      { cs: '', en: '' },
      { cs: '', en: '' },
    ],
    correctOption: question?.correctOption ?? 0,
  };
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.error === 'string' ? body.error : fallback;
  } catch {
    return fallback;
  }
}

/** SQLite datetime('now') je UTC bez zóny — bez „Z“ by se četl jako místní čas. */
function formatSqliteDate(value: string) {
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.replace(' ', 'T')}Z`;
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// QR kód jedné otázky — zvětšení, stažení PNG, tisk lístečku
// ---------------------------------------------------------------------------

function QuestionQrPanel({ url, number, printHref }: { url: string; number: number; printHref: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `kviz-otazka-${number}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 px-5 pb-5">
      <div className="p-2 bg-white rounded shrink-0">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={1024}
          marginSize={4}
          level="M"
          bgColor="#ffffff"
          fgColor="#0A0A0A"
          style={{ width: 200, height: 200 }}
        />
      </div>
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-1">Otázka {number}</p>
        <p className="font-mono text-xs text-[#F5F0E8] break-all select-all mb-4">{url}</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <button type="button" onClick={downloadPng} className={SMALL_BUTTON}>
            Stáhnout PNG
          </button>
          <a href={printHref} target="_blank" rel="noreferrer" className={SMALL_BUTTON}>
            Vytisknout lísteček
          </a>
          <a href={`/kviz/${number}`} target="_blank" rel="noreferrer" className={SMALL_BUTTON}>
            Otevřít otázku
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor jedné otázky
// ---------------------------------------------------------------------------

function QuestionEditor({
  initial,
  submitLabel,
  authHeaders,
  onSave,
  onCancel,
}: {
  initial: QuestionDraft;
  submitLabel: string;
  authHeaders: Record<string, string>;
  onSave: (draft: QuestionDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const radioName = useId();
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOption = (index: number, lang: keyof QuizOption, value: string) =>
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, i) => (i === index ? { ...o, [lang]: value } : o)),
    }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/admin/quiz/image', { method: 'POST', body: form, headers: authHeaders });
      if (!res.ok) throw new Error(await readError(res, 'Nahrání obrázku se nepovedlo.'));
      const { url } = await res.json();
      setDraft((d) => ({ ...d, imageUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nahrání obrázku se nepovedlo.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uložení se nepovedlo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 px-5 pb-5 pt-2">
      <div className="grid gap-5 md:grid-cols-[160px_1fr]">
        <div>
          <span className={LABEL}>Obrázek</span>
          <div className="aspect-square bg-[#141414] border border-[#2A2520] flex items-center justify-center overflow-hidden mb-2">
            {draft.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[#4A4540]">Bez obrázku</span>
            )}
          </div>
          <label className="block text-center text-xs tracking-[0.12em] uppercase py-2 border border-[#d8b28c]/30 text-[#d8b28c] hover:bg-[#d8b28c]/10 cursor-pointer transition-colors">
            {uploading ? 'Nahrávám…' : 'Nahrát nový'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = '';
              }}
            />
          </label>
          {draft.imageUrl && (
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, imageUrl: '' }))}
              className="mt-1 w-full text-[10px] uppercase tracking-[0.12em] text-[#7a6e65] hover:text-red-400 transition-colors"
            >
              Odebrat obrázek
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="w-32">
            <label className={LABEL}>
              Číslo stanoviště
              <input
                type="number"
                min={1}
                max={999}
                required
                value={draft.number}
                onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))}
                className={`${INPUT} mt-1`}
              />
            </label>
          </div>
          <label className={LABEL}>
            Otázka — česky
            <textarea
              rows={2}
              required
              value={draft.questionCs}
              onChange={(e) => setDraft((d) => ({ ...d, questionCs: e.target.value }))}
              className={`${INPUT} mt-1 normal-case tracking-normal`}
            />
          </label>
          <label className={LABEL}>
            Otázka — anglicky
            <textarea
              rows={2}
              value={draft.questionEn}
              onChange={(e) => setDraft((d) => ({ ...d, questionEn: e.target.value }))}
              className={`${INPUT} mt-1 normal-case tracking-normal`}
            />
          </label>
        </div>
      </div>

      <fieldset>
        <legend className={LABEL}>Odpovědi — zaškrtni správnou</legend>
        <div className="space-y-2">
          {draft.options.map((option, i) => (
            <div
              key={i}
              className={`grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_1fr] gap-2 items-center p-2 border transition-colors ${
                draft.correctOption === i
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-[#2A2520]'
              }`}
            >
              <label className="flex items-center gap-2 pr-2 cursor-pointer">
                <input
                  type="radio"
                  name={radioName}
                  checked={draft.correctOption === i}
                  onChange={() => setDraft((d) => ({ ...d, correctOption: i }))}
                  className="accent-[#d8b28c]"
                />
                <span className="text-sm text-[#d8b28c] w-5">{OPTION_LETTERS[i]})</span>
              </label>
              <input
                value={option.cs}
                required
                onChange={(e) => setOption(i, 'cs', e.target.value)}
                placeholder="česky"
                className={INPUT}
              />
              <input
                value={option.en}
                onChange={(e) => setOption(i, 'en', e.target.value)}
                placeholder="anglicky"
                className={`${INPUT} col-start-2 md:col-start-auto`}
              />
            </div>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2 text-xs tracking-[0.15em] uppercase bg-[#d8b28c] text-[#0A0A0A] font-semibold disabled:opacity-40"
        >
          {saving ? 'Ukládám…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-xs tracking-[0.15em] uppercase border border-[#2A2520] text-[#B8A99A] hover:text-[#F5F0E8] transition-colors"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Správa kvízu — tab „Kvíz“ v adminu i stránka pro organizátory
// ---------------------------------------------------------------------------

export default function QuizAdmin({ data, setData, siteBase, organizerKey }: QuizAdminProps) {
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [qrOpen, setQrOpen] = useState<number | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);

  const isOrganizer = Boolean(organizerKey);
  const authHeaders: Record<string, string> = organizerKey ? { [QUIZ_ORGANIZER_HEADER]: organizerKey } : {};
  const printPath = organizerKey ? `/kviz/organizatori/${organizerKey}/tisk` : '/admin/kviz/tisk';

  const { questions, players } = data;
  const nextNumber = questions.reduce((max, q) => Math.max(max, q.number), 0) + 1;
  const totalAnswers = players.reduce((sum, p) => sum + p.answered, 0);
  const finished = players.filter((p) => questions.length > 0 && p.answered >= questions.length).length;

  // Po změně otázek se přepočítá i skóre hráčů (správná odpověď se mohla změnit).
  const refresh = async () => {
    const res = await fetch('/api/admin/quiz', { headers: authHeaders });
    if (res.ok) setData(await res.json());
  };

  const saveQuestion = async (id: number | null, draft: QuestionDraft) => {
    const res = await fetch(id ? `/api/admin/quiz/questions?id=${id}` : '/api/admin/quiz/questions', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ ...draft, number: Number(draft.number) }),
    });
    if (!res.ok) throw new Error(await readError(res, 'Uložení se nepovedlo.'));
    const saved: QuizAdminQuestion = await res.json();
    setEditing(null);
    // Nově přidané otázce rovnou ukážeme QR kód.
    if (!id) setQrOpen(saved.id);
    await refresh();
  };

  const deleteQuestion = async (question: QuizAdminQuestion) => {
    if (!confirm(`Smazat otázku ${question.number}? Smažou se i odpovědi hostů na ni.`)) return;
    setDeletingQuestionId(question.id);
    try {
      const res = await fetch(`/api/admin/quiz/questions?id=${question.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('delete failed');
      if (editing === question.id) setEditing(null);
      await refresh();
    } catch {
      alert('Smazání se nepovedlo.');
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const deletePlayer = async (player: QuizAdminPlayer) => {
    if (!confirm(`Smazat hráče ${player.firstName} ${player.lastName} včetně odpovědí?`)) return;
    setDeletingPlayerId(player.id);
    try {
      const res = await fetch(`/api/admin/quiz/players?id=${player.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setData((d) => ({ ...d, players: d.players.filter((p) => p.id !== player.id) }));
    } catch {
      alert('Smazání se nepovedlo.');
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const deleteAllPlayers = async () => {
    if (!confirm(`Smazat VŠECH ${players.length} hráčů kvízu i s odpověďmi? (Např. po testování před svatbou.)`)) return;
    try {
      const res = await fetch('/api/admin/quiz/players?all=1', { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setData((d) => ({ ...d, players: [] }));
    } catch {
      alert('Smazání se nepovedlo.');
    }
  };

  return (
    <div className="space-y-10">
      {/* QR startu + statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative border border-[#d8b28c]/15 p-6">
          <Corners />
          <p className="text-xs tracking-[0.15em] uppercase text-[#7a6e65] mb-4">QR kód na stánek (start)</p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-[#F5F0E8] rounded">
              <QRCodeSVG value={`${siteBase}/kviz`} size={140} level="M" bgColor="#F5F0E8" fgColor="#0A0A0A" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-[family-name:var(--font-playfair)] text-[#F5F0E8] mb-1">/kviz</p>
              <p className="text-xs text-[#5a5248]">
                Mapa se stanovišti. Hosté se tu (nebo na kterékoli otázce) přihlásí jménem a příjmením.
              </p>
              <div className="flex flex-col gap-1.5 mt-3">
                <a href={printPath} target="_blank" rel="noreferrer" className={LINK}>
                  Tisk všech QR kódů na A4 →
                </a>
                <a href="/kviz/vysledky" target="_blank" rel="noreferrer" className={LINK}>
                  Veřejný průběh (bez správných odpovědí) →
                </a>
                <a href="/kviz" target="_blank" rel="noreferrer" className={LINK}>
                  Otevřít kvíz →
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          <StatCard label="Otázek" value={questions.length} />
          <StatCard label="Hráčů" value={players.length} />
          <StatCard label="Odpovědí" value={totalAnswers} />
          <StatCard label="Dohráno" value={finished} sub="zodpovězeny všechny otázky" />
        </div>
      </div>

      {/* Neveřejné stránky pro organizátory */}
      {!isOrganizer && data.organizerPath && (
        <div className="relative border border-amber-400/25 p-6">
          <Corners tone="border-amber-400/50" />
          <p className="text-xs tracking-[0.15em] uppercase text-amber-400/80 mb-4">
            Odkaz pro organizátory — hráčům nedávat
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-[#F5F0E8] rounded shrink-0">
              <QRCodeSVG
                value={`${siteBase}${data.organizerPath}`}
                size={120}
                level="M"
                bgColor="#F5F0E8"
                fgColor="#0A0A0A"
              />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-mono text-xs text-[#F5F0E8] break-all select-all mb-2">
                {siteBase}
                {data.organizerPath}
              </p>
              <p className="text-xs text-[#5a5248] mb-3">
                Výsledky se správnými odpověďmi a správa otázek s QR kódy. Bez hesla, ale adresu nejde uhodnout —
                kdo ji má, může otázky i měnit, takže ji pošli jen organizátorům. Odvozuje se z hesla do
                administrace: když heslo změníš, změní se i tenhle odkaz.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5">
                <a href={data.organizerPath} target="_blank" rel="noreferrer" className={LINK}>
                  Výsledky pro organizátory →
                </a>
                <a href={`${data.organizerPath}/otazky`} target="_blank" rel="noreferrer" className={LINK}>
                  Správa otázek pro organizátory →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Otázky */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xs tracking-[0.2em] uppercase text-[#d8b28c]">Otázky</h3>
          <button
            type="button"
            onClick={() => setEditing('new')}
            disabled={editing === 'new'}
            className="text-xs tracking-[0.12em] uppercase px-3 py-1.5 border border-[#d8b28c]/40 text-[#d8b28c] hover:bg-[#d8b28c]/10 transition-colors disabled:opacity-40"
          >
            + Přidat otázku
          </button>
        </div>
        <p className="text-xs text-[#5a5248] leading-relaxed">
          Nová otázka má hned po uložení vlastní adresu i QR kód — web není potřeba znovu nasazovat. Číslo otázky je
          číslo stanoviště v adrese (/kviz/číslo). Na mapě u startu ale nové stanoviště nebude, mapa je obrázek.
        </p>

        {editing === 'new' && (
          <div className="relative border border-[#d8b28c]/30">
            <Corners />
            <p className="px-5 pt-4 font-[family-name:var(--font-playfair)] text-[#F5F0E8]">Nová otázka</p>
            <QuestionEditor
              initial={toDraft(undefined, nextNumber)}
              submitLabel="Přidat"
              authHeaders={authHeaders}
              onSave={(draft) => saveQuestion(null, draft)}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {questions.length === 0 && editing !== 'new' && (
          <p className="text-center py-12 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
            Žádné otázky. Přidej první.
          </p>
        )}

        {questions.map((q) => {
          const url = `${siteBase}/kviz/${q.number}`;
          const isEditing = editing === q.id;
          const isQrOpen = qrOpen === q.id;
          return (
            <div key={q.id} className="relative border border-[#d8b28c]/10 hover:border-[#d8b28c]/25 transition-colors">
              <Corners tone="border-[#d8b28c]/30" />
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="font-[family-name:var(--font-playfair)] text-3xl text-[#d8b28c] w-10 shrink-0 text-center">
                  {q.number}
                </span>
                {q.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.imageUrl}
                    alt=""
                    className="hidden sm:block w-14 h-14 object-cover border border-[#2A2520] shrink-0"
                  />
                ) : (
                  <div className="hidden sm:block w-14 h-14 border border-dashed border-[#2A2520] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F0E8] line-clamp-2">{q.questionCs}</p>
                  <p className="text-xs text-emerald-400 mt-1 truncate">
                    ✓ {OPTION_LETTERS[q.correctOption]}) {q.options[q.correctOption]?.cs}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQrOpen(isQrOpen ? null : q.id)}
                  aria-label={`QR kód otázky ${q.number}`}
                  title="Zobrazit QR kód"
                  className={`p-1.5 rounded shrink-0 transition-shadow ${
                    isQrOpen ? 'bg-[#d8b28c] shadow-[0_0_0_2px_#d8b28c]' : 'bg-[#F5F0E8] hover:shadow-[0_0_0_2px_#d8b28c]'
                  }`}
                >
                  <QRCodeSVG value={url} size={56} level="M" bgColor="#F5F0E8" fgColor="#0A0A0A" />
                </button>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" onClick={() => setEditing(isEditing ? null : q.id)} className={SMALL_BUTTON}>
                    {isEditing ? 'Zavřít' : 'Upravit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q)}
                    disabled={deletingQuestionId === q.id}
                    className="text-xs tracking-[0.12em] uppercase px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    {deletingQuestionId === q.id ? 'Mažu…' : 'Smazat'}
                  </button>
                </div>
              </div>
              {isQrOpen && (
                <QuestionQrPanel url={url} number={q.number} printHref={`${printPath}?only=${q.number}`} />
              )}
              {isEditing && (
                <QuestionEditor
                  initial={toDraft(q, nextNumber)}
                  submitLabel="Uložit"
                  authHeaders={authHeaders}
                  onSave={(draft) => saveQuestion(q.id, draft)}
                  onCancel={() => setEditing(null)}
                />
              )}
            </div>
          );
        })}
      </section>

      {/* Hráči — jen v adminu */}
      {!isOrganizer && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#d8b28c]">Hráči</h3>
            {players.length > 0 && (
              <button
                type="button"
                onClick={deleteAllPlayers}
                className="text-xs tracking-[0.12em] uppercase px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Smazat všechny hráče
              </button>
            )}
          </div>

          {players.length === 0 ? (
            <p className="text-center py-12 font-[family-name:var(--font-cormorant)] text-[#5a5248] italic">
              Zatím nikdo nehraje.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2520]">
                    {['Host', 'Zodpovězeno', 'Správně', 'Začal', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-xs tracking-[0.15em] uppercase text-[#5a5248] font-normal whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                      <td className="py-3 px-3 text-[#F5F0E8] whitespace-nowrap">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="py-3 px-3 text-[#B8A99A]">
                        {p.answered} / {questions.length}
                      </td>
                      <td className="py-3 px-3 text-[#d8b28c]">{p.correct}</td>
                      <td className="py-3 px-3 text-[#5a5248] whitespace-nowrap text-xs">
                        {formatSqliteDate(p.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => deletePlayer(p)}
                          disabled={deletingPlayerId === p.id}
                          className="text-xs px-2 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        >
                          {deletingPlayerId === p.id ? '…' : 'Smazat'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
