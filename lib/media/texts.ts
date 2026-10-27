import { formatBytes } from '@/lib/media/shared';

export type MediaLang = 'cs' | 'en';

function czPlural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

const cs = {
  lang: 'EN',
  back: '← Zpět na web',
  title: 'Fotky a videa ze svatby',
  subtitle: 'Fotky od fotografky, video od kameramana a vše, co jste nafotili vy.',
  sections: {
    photographer: 'Fotografka',
    film: 'Video',
    guests: 'Od hostů',
    camera: 'Jednorázovky',
  },
  photographer: {
    intro: 'Profesionální fotky z celého dne od naší fotografky. Stáhněte si, co se vám líbí, nebo rovnou sdílejte.',
    empty: 'Fotky od fotografky sem přidáme, jakmile je dostaneme.',
    noCropTitle: 'Malá prosba',
    noCrop:
      'Pokud budete fotky zveřejňovat na sociálních sítích, prosíme, neořezávejte je — máme to tak domluvené s fotografkou. Děkujeme!',
  },
  film: {
    title: 'Svatební video',
    soon: 'Již brzy',
    promise: 'Kameraman nám video slíbil mezi 22. a 29. 10. 2026. Jakmile ho budeme mít, najdete ho právě tady.',
    intro: 'Svatební film a krátký trailer od kameramana. Pusťte si je tady, nebo si je stáhněte v kvalitě, jaká se vám hodí.',
    download: 'Stáhnout',
    original: '4K originál',
    hd: 'Full HD',
    sd: 'Do mobilu',
    downloadHint:
      'Full HD a verze do mobilu jsou MP4, které přehraje každé zařízení. 4K originál je v nejvyšší kvalitě, ale jako MOV (HEVC) ho starší počítače s Windows nemusí přehrát.',
  },
  guestsIntro: 'Nahrajte, co jste nafotili, a stáhněte si, co nafotili ostatní.',
  camera: {
    intro: 'Slíbili jsme, že to vyvoláme — tady to je! Snímky z jednorázového fotoaparátu přes QR kód, každý měl na filmu 25 políček.',
    empty: 'Z jednorázového fotoaparátu tu zatím nic není.',
  },
  admin: {
    upload: (section: string) => `Nahrát do sekce „${section}“`,
    hint: 'Vidíte jen vy jako admin. Originály se uloží v plné kvalitě.',
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
    sortTaken: 'Čas pořízení',
    sortUploaded: 'Nově nahrané',
    select: 'Vybrat',
    cancelSelect: 'Zrušit',
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
    download: 'Stáhnout',
    share: 'Sdílet',
    sharePreparing: 'Připravuji…',
    shareFailed: 'Sdílení se nepovedlo. Zkuste fotku stáhnout a sdílet z galerie telefonu.',
    delete: 'Smazat',
    confirmDelete: 'Opravdu smazat? Nejde to vrátit.',
    deleteFailed: 'Smazání se nepovedlo.',
    noCrop: 'Při zveřejnění prosíme fotku neořezávejte (domluva s fotografkou).',
    processing: 'Video se ještě převádí pro přehrávání — zatím hraje originál.',
    noPreview: 'Tenhle formát prohlížeč neumí zobrazit — originál si ale můžete stáhnout.',
  },
};

const en: typeof cs = {
  lang: 'CZ',
  back: '← Back to the website',
  title: 'Wedding photos & videos',
  subtitle: 'Photos from our photographer, the wedding film and everything you captured.',
  sections: {
    photographer: 'Photographer',
    film: 'Film',
    guests: 'From guests',
    camera: 'Disposable',
  },
  photographer: {
    intro: 'Professional photos from the whole day by our photographer. Download what you like or share it right away.',
    empty: 'We’ll add the photographer’s photos as soon as we get them.',
    noCropTitle: 'A small request',
    noCrop:
      'If you post these photos on social media, please don’t crop them — we agreed on this with our photographer. Thank you!',
  },
  film: {
    title: 'Wedding film',
    soon: 'Coming soon',
    promise: 'Our videographer promised the film between 22 and 29 October 2026. You’ll find it right here once we have it.',
    intro: 'The wedding film and a short trailer from our videographer. Watch them here or download them in the quality that suits you.',
    download: 'Download',
    original: '4K original',
    hd: 'Full HD',
    sd: 'For phones',
    downloadHint:
      'Full HD and the phone version are MP4 files that play on any device. The 4K original has the best quality, but as a MOV (HEVC) file it may not play on older Windows computers.',
  },
  guestsIntro: 'Upload what you captured and download what everyone else did.',
  camera: {
    intro: 'We promised to develop the film — here it is! Shots from the QR-code disposable camera, 25 frames each.',
    empty: 'Nothing from the disposable camera yet.',
  },
  admin: {
    upload: (section: string) => `Upload to “${section}”`,
    hint: 'Only visible to you as admin. Originals are stored in full quality.',
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
    sortTaken: 'Time taken',
    sortUploaded: 'Newest',
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
    download: 'Download',
    share: 'Share',
    sharePreparing: 'Preparing…',
    shareFailed: 'Sharing failed. Try downloading the photo and sharing it from your phone’s gallery.',
    delete: 'Delete',
    confirmDelete: 'Really delete? This can’t be undone.',
    deleteFailed: 'Delete failed.',
    noCrop: 'When posting, please don’t crop the photo (agreed with our photographer).',
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
