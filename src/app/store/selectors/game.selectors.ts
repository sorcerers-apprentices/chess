import { createSelector } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import type { GameStateType } from '@/app/store/states/game.state';

const selectGame = (state: AppStateType): GameStateType => state.game;

export const selectChessGame = createSelector(
  selectGame,
  (state: GameStateType) => state.game,
);
