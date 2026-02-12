import type { GameResultType } from '@/app/services/game.service';
import type { StoredMove } from '@/app/types/chess-type/chess-game.type';
import { DEFAULT_POSITION_FEN } from '@/app/constants/chess-game.constants';

export type MoveRecordType = {
  move: StoredMove;
  fenAfter: string;

  ply: number;
  player_id: string | null;
  is_check: boolean;
  is_checkmate: boolean;
};

// Данные игры (без UI)
export type GameDomainType = {
  id: string;
  pgn: string;
  pgnLast: string | null;
  fen: string;
  moves: MoveRecordType[];
  undoneMoves: MoveRecordType[];
  lastMove: { from: string; to: string } | null;
  orientation: 'white' | 'black';
  finished: boolean;
  result: GameResultType | null;
  finalFen: string | null;
};

// Store-состояние = данные + UI
export type GameStateType = GameDomainType & {
  // UI-состояние загрузки
  loading: boolean;
  error: string | null;
};

export const initialGameState: GameStateType = {
  pgn: '',
  pgnLast: null,
  fen: DEFAULT_POSITION_FEN,
  id: '',
  moves: [],
  undoneMoves: [],
  lastMove: null,
  orientation: 'black',
  finished: false,
  result: null,
  finalFen: null,

  loading: false,
  error: null,
};
