import { Chess } from 'chess.js';
import { DEFAULT_POSITION } from 'chess.js';
import type { GameResultType } from '@/app/services/game.service';
import type { StoredMove } from '@/app/types/store-game.type';

export type MoveRecordType = {
  move: StoredMove;
  fenAfter: string;
  timestamp: number;
};

export type GameStateType = {
  id: string;
  pgn: string;
  pgnLast: string | null;
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
  pgnLast: null,
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
