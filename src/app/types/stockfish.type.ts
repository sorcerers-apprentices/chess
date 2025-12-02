import type { Square } from 'chess.js';

export type EngineStatus = 'not-ready' | 'ready' | 'error';

export type BestMove = {
  move: string;
  ponder?: string;
};

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export type EngineMove = {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
  raw: string; // исходная строка от движка: 'e2e4', 'e7e8q'
};

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_VALUES: GameDifficulty[] = ['easy', 'medium', 'hard'];

export type EngineDifficultyConfig = {
  depth: number;
  skill: number;
  timeoutMs: number;
};

export const ENGINE_DIFFICULTY_PRESETS: Record<
  GameDifficulty,
  EngineDifficultyConfig
> = {
  easy: {
    depth: 4,
    skill: 0, // минимальный Skill Level (0–20)
    timeoutMs: 2000,
  },
  medium: {
    depth: 8,
    skill: 10,
    timeoutMs: 4000,
  },
  hard: {
    depth: 14,
    skill: 20, // максимальный Skill Level
    timeoutMs: 7000,
  },
};

export type EngineRequestOptions = {
  depth?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type WaitForBestMoveOptions = {
  timeoutMs: number;
  signal?: AbortSignal;
};

export type DifficultyOptionUI = {
  labelKey: string;
  descriptionKey: string;
};

export const DIFFICULTY_OPTIONS: Record<GameDifficulty, DifficultyOptionUI> = {
  easy: {
    labelKey: 'home.difficulty.easy.label',
    descriptionKey: 'home.difficulty.easy.description',
  },
  medium: {
    labelKey: 'home.difficulty.medium.label',
    descriptionKey: 'home.difficulty.medium.description',
  },
  hard: {
    labelKey: 'home.difficulty.hard.label',
    descriptionKey: 'home.difficulty.hard.description',
  },
};
