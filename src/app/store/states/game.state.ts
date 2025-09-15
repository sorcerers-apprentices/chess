import { DEFAULT_POSITION } from '@/app/constants/chess-game.constants';

export type ChessMoveType = {
  move: string;
  timestamp: number;
  moveNumber: number;
  color: 'white' | 'black';
};

export type GameStateType = {
  moves: ChessMoveType[];
  currentMoveIndex: number;
  initialFen: string;
};

export const initialGameState: GameStateType = {
  moves: [],
  currentMoveIndex: -1,
  initialFen: DEFAULT_POSITION,
};
