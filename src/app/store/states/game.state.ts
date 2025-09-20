import type { Move } from 'chess.js';
import { DEFAULT_POSITION } from 'chess.js';

export type MoveRecordType = {
  uci: string;
  san: string;
  move: Move;
  fenAfter: string;
  timestamp?: number;
};

export type GameStateType = {
  fen: string;
  id: string;
  moves: MoveRecordType[];
  undoneMoves: MoveRecordType[];
  lastMove?: { from: string; to: string } | null;
  orientation: 'white' | 'black';
  clocks?: { white: number; black: number } | null;
};

export const initialGameState: GameStateType = {
  fen: DEFAULT_POSITION,
  id: '',
  moves: [],
  undoneMoves: [],
  lastMove: null,
  orientation: 'black',
  clocks: null,
};
