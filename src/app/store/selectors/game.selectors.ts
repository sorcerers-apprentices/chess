import { createSelector } from '@ngrx/store';
import type { AppStateType } from '../states/app.state';
import type { GameStateType } from '../states/game.state';

const selectGame = (state: AppStateType): GameStateType => state.game;

export const selectGameMoves = createSelector(
  selectGame,
  (state: GameStateType) => state.moves,
);
