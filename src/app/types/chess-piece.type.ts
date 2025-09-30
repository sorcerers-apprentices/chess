import type { Square } from 'chess.js';

export type MoveRow = {
  num: number;
  player?: { from: Square; to: Square };
  opponent?: { from: Square; to: Square };
  playerText: string;
  opponentText: string;
};

export type ResultVariant = 'win' | 'loss' | 'draw';
