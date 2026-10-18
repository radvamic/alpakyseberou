'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GuestIdentityForm from '@/components/guest/GuestIdentityForm';
import { formatGuestName, type GuestIdentity } from '@/lib/guest-identity';
import { formatBytes, type MediaCollection } from '@/lib/media/shared';
import { formatEta, type MediaLang, type MediaTexts } from '@/lib/media/texts';
import type { AddResult, MediaUploader, UploadSnapshot } from '@/lib/media/uploader';

interface UploadPanelProps {
  lang: MediaLang;
  texts: MediaTexts;
  identity: GuestIdentity | null;
  onIdentity: (identity: GuestIdentity | null) => void;
  uploader: MediaUploader | null;
  snapshot: UploadSnapshot;
  pendingFromLastVisit: number;
  /** guests = hosté (se jménem); jinak nahrává admin do sekce fotografa / videa. */
  collection?: MediaCollection;
  sectionLabel?: string;
}

export default function UploadPanel({
  lang,
  texts,
  identity,
  onIdentity,
  uploader,
  snapshot,
  pendingFromLastVisit,
  collection = 'guests',
  sectionLabel = '',
}: UploadPanelProps) {
  const forGuests = collection === 'guests';
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string[]>([]);
  const t = texts.upload;

  if (forGuests && !identity) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <p className="mb-5 text-sm leading-relaxed text-[#B8A99A]">{texts.identity.intro}</p>
        <GuestIdentityForm
          texts={texts.identity}
          loading={false}
          onSubmit={async (value) => onIdentity(value)}
        />
      </div>
    );
  }

  const onFiles = (files: FileList | null) => {
    if (!files || !uploader) return;
    const result: AddResult = uploader.add(files, collection);
    const messages: string[] = [];
    if (result.unsupported) messages.push(t.unsupported(result.unsupported));
    if (result.tooLarge) messages.push(t.tooLarge(result.tooLarge));
    setNotice(messages);
    if (inputRef.current) inputRef.current.value = '';
  };

  const {
    totalCount,
    doneCount,
    skippedCount,
    failedCount,
    totalBytes,
    loadedBytes,
    active,
    offline,
    bytesPerSecond,
  } = snapshot;
  const finishedCount = doneCount + skippedCount;
  const percent = totalBytes > 0 ? Math.min(100, (loadedBytes / totalBytes) * 100) : 0;
  const etaSeconds = bytesPerSecond > 0 ? (totalBytes - loadedBytes) / bytesPerSecond : null;
  const current = snapshot.jobs.filter((j) => j.status === 'uploading').slice(0, 3);

  return (
    <div className="mx-auto max-w-xl">
      {forGuests && identity ? (
      <p className="mb-4 text-center text-sm text-[#B8A99A]">
        {texts.identity.as(formatGuestName(identity.firstName, identity.lastName))}
        {!active && (
          <>
            {' · '}
            <button
              type="button"
              onClick={() => onIdentity(null)}
              className="text-[#d8b28c] underline underline-offset-2"
            >
              {texts.identity.change}
            </button>
          </>
        )}
      </p>
      ) : (
        <p className="mb-3 text-center text-xs text-[#7a6e65]">{texts.admin.hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={collection === 'film' ? 'video/*' : forGuests ? 'image/*,video/*' : 'image/*'}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current?.click()}
        className={
          forGuests
            ? 'min-h-16 w-full rounded-2xl bg-[#d8b28c] px-6 py-4 text-lg font-medium text-[#0A0A0A] shadow-[0_10px_40px_-15px_rgba(216,178,140,0.6)]'
            : 'min-h-12 w-full rounded-2xl border border-dashed border-[#d8b28c]/50 px-6 py-3 text-sm text-[#d8b28c]'
        }
      >
        {forGuests ? `📸 ${totalCount > 0 ? t.pickMore : t.pick}` : `＋ ${texts.admin.upload(sectionLabel)}`}
      </motion.button>

      {forGuests && pendingFromLastVisit > 0 && totalCount === 0 && (
        <p className="mt-4 rounded-xl border border-[#d8b28c]/30 bg-[#d8b28c]/5 px-4 py-3 text-sm text-[#d8b28c]">
          {t.pending(pendingFromLastVisit)}
        </p>
      )}

      {notice.map((message) => (
        <p key={message} className="mt-3 text-center text-xs text-[#B8A99A]">
          {message}
        </p>
      ))}

      {forGuests && totalCount === 0 && (
        <ul className="mt-6 space-y-2 text-sm text-[#B8A99A]">
          {t.tips.map((tip) => (
            <li key={tip} className="flex gap-3">
              <span className="text-[#d8b28c]">✦</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-2xl border border-[#2A2520] bg-[#111111] p-5"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-[#F5F0E8]">
                {active ? t.progress(finishedCount, totalCount) : failedCount === 0 ? t.finished : t.progress(finishedCount, totalCount)}
              </span>
              <span className="text-xs text-[#B8A99A]">{Math.floor(percent)} %</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#2A2520]">
              <motion.div
                className="h-full rounded-full bg-[#d8b28c]"
                animate={{ width: `${percent}%` }}
                transition={{ ease: 'linear', duration: 0.3 }}
              />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-[#B8A99A]">
              <span>{t.bytes(loadedBytes, totalBytes)}</span>
              {active && etaSeconds !== null && <span>{t.eta(formatEta(etaSeconds, lang))}</span>}
            </div>

            {active && (
              <p className="mt-3 text-xs text-[#d8b28c]">
                {offline ? t.offline : t.keepOpen}
              </p>
            )}

            {current.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {current.map((job) => (
                  <li key={job.id} className="text-xs text-[#7a6e65]">
                    <div className="flex justify-between gap-3">
                      <span className="truncate">{job.file.name}</span>
                      <span className="shrink-0">{formatBytes(job.file.size, lang)}</span>
                    </div>
                    <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-[#2A2520]">
                      <div
                        className="h-full bg-[#d8b28c]/60"
                        style={{ width: `${Math.min(100, (job.loaded / job.file.size) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {skippedCount > 0 && (
              <p className="mt-3 text-xs text-[#B8A99A]">{t.skipped(skippedCount)}</p>
            )}

            {failedCount > 0 && !active && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-red-400">{t.failed(failedCount)}</p>
                <button
                  type="button"
                  onClick={() => uploader?.retryFailed()}
                  className="rounded-full border border-[#d8b28c]/50 px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-[#d8b28c]"
                >
                  {t.retry}
                </button>
              </div>
            )}

            {!active && failedCount === 0 && (
              <button
                type="button"
                onClick={() => uploader?.clearFinished()}
                className="mt-4 text-xs text-[#7a6e65] underline underline-offset-2"
              >
                {t.clear}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
