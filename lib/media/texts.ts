import { formatBytes } from '@/lib/media/shared';

export type MediaLang = 'cs' | 'en';

function czPlural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

const cs = {
  lang: 'EN',
  back: '← Zpět na web',
  title: 'Fotky a videa ze svatby',
  subtitle: 'Nahrajte, co jste nafotili, a stáhněte si, co nafotili ostatní.',
  access: {
    intro: 'Galerie je jen pro svatebčany. Zadejte prosím svatební kód.',
    placeholder: 'Svatební kód',
    submit: 'Vstoupit',
    checking: 'Ověřuji…',
    wrong: 'Tenhle kód nesedí. Zkuste to prosím znovu.',
    error: 'Něco se pokazilo. Zkuste to prosím znovu.',
  },
  identity: {
    intro: 'Kdo nahrává? Jméno uvidí ostatní u vašich fotek.',
    firstName: 'Jméno',
    lastName: 'Příjmení',
    hint: 'Příjmení potřebujeme, abychom od sebe rozeznali jmenovce.',
    submit: 'Pokračovat',
    loading: 'Ukládám…',
    error: 'Něco se pokazilo. Zkuste to znovu.',
    as: (name: string) => `Nahráváte jako ${name}`,
    change: 'změnit',
  },
  upload: {
    pick: 'Vybrat fotky a videa',
    pickMore: 'Přidat další',
    tips: [
      'Klidně vyberte stovky fotek i dlouhá videa najednou.',
      'Nechte stránku otevřenou a telefon odemčený, dokud se vše nenahraje.',
      'Nejrychlejší je to přes Wi-Fi.',
      'Když se nahrávání přeruší, vyberte stejné soubory znovu — už nahrané se přeskočí.',
    ],
    progress: (done: number, total: number) => `Nahráno ${done} z ${total}`,
    bytes: (loaded: number, total: number) => `${formatBytes(loaded)} z ${formatBytes(total)}`,
    eta: (text: string) => `zbývá ${text}`,
    finished: 'Hotovo, děkujeme! ❤️',
    skipped: (n: number) => `${n} ${czPlural(n, 'soubor už byl nahraný', 'soubory už byly nahrané', 'souborů už bylo nahraných')} dříve`,
    failed: (n: number) => `${n} ${czPlural(n, 'soubor se nepodařilo nahrát', 'soubory se nepodařilo nahrát', 'souborů se nepodařilo nahrát')}`,
    retry: 'Zkusit znovu',
    clear: 'Zavřít přehled',
    offline: 'Jste offline — nahrávání pokračuje, jakmile se připojíte.',
    keepOpen: 'Nezavírejte stránku a nezamykejte telefon.',
    unsupported: (n: number) => `${n} ${czPlural(n, 'soubor není', 'soubory nejsou', 'souborů není')} fotka ani video — ${czPlural(n, 'přeskočen', 'přeskočeny', 'přeskočeno')}.`,
    tooLarge: (n: number) => `${n} ${czPlural(n, 'soubor je', 'soubory jsou', 'souborů je')} větší než 30 GB.`,
    pending: (n: number) =>
      `Minule se ${n} ${czPlural(n, 'soubor nedonahrál', 'soubory nedonahrály', 'souborů nedonahrálo')}. Vyberte je prosím znovu — navážeme, kde se skončilo.`,
  },
  gallery: {
    title: 'Galerie',
    empty: 'Zatím tu nic není. Buďte první!',
    all: 'Všichni',
    mine: 'Moje',
    sortTaken: 'Podle času pořízení',
    sortUploaded: 'Naposledy nahrané',
    select: 'Vybrat',
    cancelSelect: 'Zrušit výběr',
    selectAll: 'Vybrat vše',
    selectNone: 'Odznačit vše',
    selected: (n: number, bytes: number) => `${n} ${czPlural(n, 'vybraný', 'vybrané', 'vybraných')} · ${formatBytes(bytes)}`,
    download: 'Stáhnout',
    downloadHint: 'Stáhne se jeden ZIP s originály, roztříděný do složek podle hostů.',
    downloadStarting: 'Stahování začíná…',
    processing: 'Zpracovává se…',
    noPreview: 'Bez náhledu',
    showMore: 'Načíst další',
    count: (n: number) => `${n} ${czPlural(n, 'položka', 'položky', 'položek')}`,
  },
  lightbox: {
    close: 'Zavřít',
    prev: 'Předchozí',
    next: 'Další',
    download: 'Stáhnout originál',
    delete: 'Smazat',
    confirmDelete: 'Opravdu smazat? Nejde to vrátit.',
    deleteFailed: 'Smazání se nepovedlo.',
    processing: 'Video se ještě převádí pro přehrávání — zatím hraje originál.',
    noPreview: 'Tenhle formát prohlížeč neumí zobrazit — originál si ale můžete stáhnout.',
  },
};

const en: typeof cs = {
  lang: 'CZ',
  back: '← Back to the website',
  title: 'Wedding photos & videos',
  subtitle: 'Upload what you captured and download what everyone else did.',
  access: {
    intro: 'The gallery is for wedding guests only. Please enter the wedding code.',
    placeholder: 'Wedding code',
    submit: 'Enter',
    checking: 'Checking…',
    wrong: 'That code doesn’t match. Please try again.',
    error: 'Something went wrong. Please try again.',
  },
  identity: {
    intro: 'Who is uploading? Others will see your name next to your photos.',
    firstName: 'First name',
    lastName: 'Last name',
    hint: 'We need your last name to tell namesakes apart.',
    submit: 'Continue',
    loading: 'Saving…',
    error: 'Something went wrong. Please try again.',
    as: (name: string) => `Uploading as ${name}`,
    change: 'change',
  },
  upload: {
    pick: 'Choose photos & videos',
    pickMore: 'Add more',
    tips: [
      'Feel free to pick hundreds of photos and long videos at once.',
      'Keep this page open and your phone unlocked until everything is uploaded.',
      'Wi-Fi is the fastest.',
      'If the upload gets interrupted, just pick the same files again — finished ones are skipped.',
    ],
    progress: (done: number, total: number) => `Uploaded ${done} of ${total}`,
    bytes: (loaded: number, total: number) => `${formatBytes(loaded, 'en')} of ${formatBytes(total, 'en')}`,
    eta: (text: string) => `${text} left`,
    finished: 'All done, thank you! ❤️',
    skipped: (n: number) => `${n} ${n === 1 ? 'file was' : 'files were'} already uploaded before`,
    failed: (n: number) => `${n} ${n === 1 ? 'file' : 'files'} failed to upload`,
    retry: 'Try again',
    clear: 'Close summary',
    offline: 'You are offline — the upload will continue once you reconnect.',
    keepOpen: 'Don’t close this page or lock your phone.',
    unsupported: (n: number) => `${n} ${n === 1 ? 'file is' : 'files are'} not a photo or video — skipped.`,
    tooLarge: (n: number) => `${n} ${n === 1 ? 'file is' : 'files are'} larger than 30 GB.`,
    pending: (n: number) =>
      `${n} ${n === 1 ? 'file' : 'files'} didn’t finish uploading last time. Please pick ${n === 1 ? 'it' : 'them'} again — we’ll continue where it stopped.`,
  },
  gallery: {
    title: 'Gallery',
    empty: 'Nothing here yet. Be the first!',
    all: 'Everyone',
    mine: 'Mine',
    sortTaken: 'By time taken',
    sortUploaded: 'Recently uploaded',
    select: 'Select',
    cancelSelect: 'Cancel',
    selectAll: 'Select all',
    selectNone: 'Deselect all',
    selected: (n: number, bytes: number) => `${n} selected · ${formatBytes(bytes, 'en')}`,
    download: 'Download',
    downloadHint: 'You’ll get one ZIP with the originals, sorted into folders by guest.',
    downloadStarting: 'Download starting…',
    processing: 'Processing…',
    noPreview: 'No preview',
    showMore: 'Load more',
    count: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
  },
  lightbox: {
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    download: 'Download original',
    delete: 'Delete',
    confirmDelete: 'Really delete? This can’t be undone.',
    deleteFailed: 'Delete failed.',
    processing: 'The video is still being converted — playing the original for now.',
    noPreview: 'Your browser can’t display this format — but you can download the original.',
  },
};

export const MEDIA_TEXTS = { cs, en };
export type MediaTexts = typeof cs;

export function formatEta(seconds: number, lang: MediaLang): string {
  if (seconds < 60) return lang === 'cs' ? 'necelá minuta' : 'under a minute';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return lang === 'cs' ? `~${minutes} min` : `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return lang === 'cs' ? `~${hours} h ${rest} min` : `~${hours} h ${rest} min`;
}
