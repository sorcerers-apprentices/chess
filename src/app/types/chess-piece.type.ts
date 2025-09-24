import type { Square } from 'chess.js';

export type BoardOrientationType = 'whiteBottom' | 'whiteTop';

export type MoveRow = {
  num: number;
  player?: { from: Square; to: Square };
  opponent?: { from: Square; to: Square };
  playerText: string;
  opponentText: string;
};
