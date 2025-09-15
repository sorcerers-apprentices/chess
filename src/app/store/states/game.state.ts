import { Chess } from 'chess.js';

export type GameStateType = {
  game: Chess;
};

export const initialGameState: GameStateType = {
  game: new Chess(),
};
