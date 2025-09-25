import { type Move } from 'chess.js';
import { Chess } from 'chess.js';
import { DEFAULT_POSITION } from 'chess.js';
import type { GameResultType } from '@/app/services/game.service';

export type MoveRecordType = {
  uci: string;
  san: string;
  move: Move;
  fenAfter: string;
  timestamp?: number;
};

export type GameStateType = {
  id: string;
  pgn: string;
  fen: string;
  moves: MoveRecordType[];
  undoneMoves: MoveRecordType[];
  lastMove?: { from: string; to: string } | null;
  orientation: 'white' | 'black';
  clocks?: { white: number; black: number } | null;
  finished: boolean;
  result: GameResultType | null;
  finalFen?: string | null;
};

export const initialGameState: GameStateType = {
  pgn: new Chess(DEFAULT_POSITION).pgn(),
  fen: DEFAULT_POSITION,
  id: '',
  moves: [],
  undoneMoves: [],
  lastMove: null,
  orientation: 'black',
  clocks: null,
  finished: false,
  result: null,
  finalFen: null,
};
