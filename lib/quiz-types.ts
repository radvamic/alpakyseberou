import type { QuizOption } from '@/db/schema';

// Typy sdílené mezi API kvízu a jeho stránkami (klient i server).

export type { QuizOption };
export type QuizLang = 'cs' | 'en';

export const OPTION_LETTERS = ['a', 'b', 'c', 'd', 'e'] as const;

/** Hlavička, kterou stránky organizátorů autorizují správu otázek. */
export const QUIZ_ORGANIZER_HEADER = 'x-quiz-organizer-key';

/** questionId → index zvolené odpovědi */
export type QuizAnswerMap = Record<number, number>;

export interface QuizPlayerState {
  token: string;
  firstName: string;
  lastName: string;
  answers: QuizAnswerMap;
}

export interface QuizQuestionSummary {
  id: number;
  number: number;
}

/** Otázka pro hosty — bez správné odpovědi. */
export interface QuizPublicQuestion {
  id: number;
  number: number;
  imageUrl: string;
  questionCs: string;
  questionEn: string;
  options: QuizOption[];
  total: number;
}

export interface QuizResultQuestion {
  id: number;
  number: number;
  questionCs: string;
  questionEn: string;
  options: QuizOption[];
  correctOption: number;
  answeredCount: number;
  correctCount: number;
}

export interface QuizResultPlayer {
  id: number;
  name: string;
  answered: number;
  correct: number;
  /** questionId → odpověděl správně? (chybí = neodpověděl) */
  cells: Record<number, boolean>;
}

/** Výsledky pro organizátory — včetně správnosti. */
export interface QuizResults {
  questions: QuizResultQuestion[];
  players: QuizResultPlayer[];
}

/** Veřejný průběh — jen kdo hraje a kolik zodpověděl, nic o správnosti. */
export interface QuizPublicProgress {
  total: number;
  players: { id: number; name: string; answered: number }[];
}

export interface QuizAdminQuestion {
  id: number;
  number: number;
  imageUrl: string;
  questionCs: string;
  questionEn: string;
  options: QuizOption[];
  correctOption: number;
}

export interface QuizAdminData {
  questions: QuizAdminQuestion[];
  players: QuizAdminPlayer[];
  /** Neveřejná adresa výsledků pro organizátory, např. /kviz/organizatori/<klíč> */
  organizerPath: string;
}

export interface QuizAdminPlayer {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  answered: number;
  correct: number;
}
