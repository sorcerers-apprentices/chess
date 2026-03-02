import type { GameDifficulty } from '@/app/types/stockfish.type';

export const ENGINE_DEFAULT_DEPTH = 8;
export const ENGINE_DEFAULT_TIMEOUT_MS = 5000;
export const ENGINE_DEFAULT_DIFFICULTY: GameDifficulty = 'medium';
export const ENGINE_POLL_INTERVAL_MS = 50;
export const EQUAL_POSITION_THRESHOLD_CP = 30;
