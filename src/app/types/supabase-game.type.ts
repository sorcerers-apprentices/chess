import type { GameResultType } from '@/app/services/game.service';
import type { MoveRecordType } from '@/app/store/states/game.state';

type GameResult = 'PENDING' | 'DRAW' | 'WHITE_WINS' | 'BLACK_WINS';
export type BoardCell = { file: string; rank: number };

export type GameModel = {
  fen: string;
  id: string;
  created_at: Date;
  lastMoveFrom: string;
  lastMoveTo: string;
  playerId: string;
  clocksWhite: number;
  clocksBlack: number;
  finished: boolean;
  playerColor: 'white' | 'black';
  result: GameResult;
  finalFen: string;
};

export type GameStateTypeууу = {
  fen: string;
  id: string;
  moves: MoveRecordType[];
  undoneMoves: MoveRecordType[];
  lastMove?: { from: string; to: string } | null;
  orientation: 'white' | 'black';
  clocks?: { white: number; black: number } | null;
  finished: boolean;
  result: GameResultType | null;
  finalFen?: string | null;
};

export type MoveModel = {
  gameId: string;
  from: BoardCell;
  to: BoardCell;
  uci: string;
  san: string;
  fenAfter: string;
  timestamp?: number;
  piece: string;
  captured: string;
  promotion: string;
};
