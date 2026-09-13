import type { QuizLang } from '@/lib/quiz-types';

// Texty UI kvízu. Obsah otázek je v databázi (CZ i EN) a edituje se v adminu.

function successRate(locale: 'cs' | 'en', correct: number, answered: number): string {
  if (answered === 0) return locale === 'cs' ? 'Zatím bez odpovědí' : 'No answers yet';
  const pct = Math.round((correct / answered) * 100);
  return locale === 'cs'
    ? `${pct} % správně (${correct}/${answered})`
    : `${pct}% correct (${correct}/${answered})`;
}

const cs = {
  lang: 'EN',
  brand: 'Svatební kvíz',
  title: 'Jak dobře znáš ženicha s nevěstou?',
  identityIntro: 'Než začneš, napiš nám, kdo jsi. Na dalších stanovištích už tě poznáme.',
  form: {
    firstName: 'Jméno',
    lastName: 'Příjmení',
    hint: 'Příjmení potřebujeme, abychom od sebe rozeznali jmenovce.',
    submit: 'Jdu hrát',
    loading: 'Načítám…',
    error: 'Něco se pokazilo. Zkus to znovu.',
  },
  hello: (name: string) => `Ahoj, ${name}!`,
  howTo:
    'Po areálu najdeš očíslovaná stanoviště (jsou na mapě níže). Na každém visí lísteček s QR kódem — naskenuj ho telefonem a odpověz na otázku.',
  map: 'Mapa',
  satellite: 'Satelit',
  openMapy: 'Otevřít v Mapy.cz',
  progressTitle: 'Tvůj postup',
  answered: (answered: number, total: number) => `Zodpovězeno ${answered} / ${total}`,
  progressHint:
    'Zlatá čísla máš hotová — klepnutím se k otázce vrátíš a odpověď můžeš změnit. Ostatní najdi na mapě.',
  allDone: 'Máš hotovo! Odpovědi můžeš měnit, dokud kvíz neskončí.',
  showResults: 'Průběh kvízu',
  notYou: (name: string) => `Nejsi ${name}?`,
  switchPlayer: 'Přepnout hráče',
  questionOf: (number: number, total: number) => `Otázka ${number} / ${total}`,
  saving: 'Ukládám…',
  saved: 'Uloženo ✓',
  savedHint: 'Odpověď můžeš změnit, dokud kvíz neskončí.',
  saveError: 'Odpověď se nepodařilo uložit. Zkus to znovu.',
  backToMap: '← Zpět na mapu',
  notFoundTitle: 'Tahle otázka neexistuje',
  notFoundText: 'Zkus QR kód naskenovat znovu, nebo se vrať na mapu.',
  loadError: 'Nepodařilo se načíst. Zkontroluj připojení a zkus to znovu.',
  retry: 'Zkusit znovu',
  resultsTitle: 'Výsledky kvízu',
  colPlayer: 'Host',
  colCorrect: 'Správně',
  colAnswered: 'Zodpovězeno',
  noPlayers: 'Zatím nikdo nehraje — naskenuj QR kód a buď první!',
  correctAnswers: 'Správné odpovědi',
  successRate: (correct: number, answered: number) => successRate('cs', correct, answered),
  playerCount: (count: number) => `Hráčů: ${count}`,
  fullscreen: 'Celá obrazovka',
  exitFullscreen: 'Zmenšit',
  tieNote: 'Při shodě vede ten, kdo odpověděl dřív. Stránka se obnovuje sama.',
  playToo: 'Hraj taky!',
  boardTitle: 'Průběh kvízu',
  boardNote: 'Kolik otázek kdo zodpověděl. Správné odpovědi a vítěze vyhlásíme na konci.',
  organizerBadge: 'Pro organizátory',
  invalidLink: 'Neplatný odkaz.',
};

export type QuizText = typeof cs;

const en: QuizText = {
  lang: 'CZ',
  brand: 'Wedding quiz',
  title: 'How well do you know the bride and groom?',
  identityIntro: 'Before you start, tell us who you are. We will recognise you at the other stations.',
  form: {
    firstName: 'First name',
    lastName: 'Surname',
    hint: 'We ask for your surname so we can tell guests with the same name apart.',
    submit: "Let's play",
    loading: 'Loading…',
    error: 'Something went wrong. Please try again.',
  },
  hello: (name: string) => `Hi, ${name}!`,
  howTo:
    'Numbered stations are spread around the venue (see the map below). Each has a card with a QR code — scan it with your phone and answer the question.',
  map: 'Map',
  satellite: 'Satellite',
  openMapy: 'Open in Mapy.cz',
  progressTitle: 'Your progress',
  answered: (answered: number, total: number) => `Answered ${answered} / ${total}`,
  progressHint:
    'Gold numbers are done — tap one to go back and change your answer. Find the rest on the map.',
  allDone: 'All done! You can change your answers until the quiz ends.',
  showResults: 'Quiz progress',
  notYou: (name: string) => `Not ${name}?`,
  switchPlayer: 'Switch player',
  questionOf: (number: number, total: number) => `Question ${number} / ${total}`,
  saving: 'Saving…',
  saved: 'Saved ✓',
  savedHint: 'You can change your answer until the quiz ends.',
  saveError: 'Could not save your answer. Please try again.',
  backToMap: '← Back to the map',
  notFoundTitle: 'This question does not exist',
  notFoundText: 'Try scanning the QR code again, or go back to the map.',
  loadError: 'Could not load. Check your connection and try again.',
  retry: 'Try again',
  resultsTitle: 'Quiz results',
  colPlayer: 'Guest',
  colCorrect: 'Correct',
  colAnswered: 'Answered',
  noPlayers: 'Nobody is playing yet — scan the QR code and be the first!',
  correctAnswers: 'Correct answers',
  successRate: (correct: number, answered: number) => successRate('en', correct, answered),
  playerCount: (count: number) => `Players: ${count}`,
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  tieNote: 'On a tie, whoever answered first ranks higher. The page refreshes itself.',
  playToo: 'Play too!',
  boardTitle: 'Quiz progress',
  boardNote: 'How many questions each guest has answered. Correct answers and the winner will be revealed at the end.',
  organizerBadge: 'For organisers',
  invalidLink: 'Invalid link.',
};

export const QUIZ_T: Record<QuizLang, QuizText> = { cs, en };

/** Anglický text, pokud existuje — jinak český. */
export function localized(lang: QuizLang, textCs: string, textEn: string): string {
  return lang === 'en' && textEn ? textEn : textCs;
}
