import type { NotationSquare } from '@/app/types/chess-type/chess-square.type';

export type MoveRow = {
  num: number;
  player?: { from: NotationSquare; to: NotationSquare };
  opponent?: { from: NotationSquare; to: NotationSquare };
  playerText: string;
  opponentText: string;
};

export type ResultVariant = 'win' | 'loss' | 'draw';

export type PersistShape = { elapsedMs: number; since: number | null };
