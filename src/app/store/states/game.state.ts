import { DEFAULT_POSITION } from 'chess.js';

export type GameStateType = {
  fen: string;
};

export const initialGameState: GameStateType = {
  fen: DEFAULT_POSITION,
};
