import { createSelector } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import type { GameStateType } from '@/app/store/states/game.state';

const selectGameState = (state: AppStateType): GameStateType => state.game;

export const selectChessFen = createSelector(
  selectGameState,
  (state) => state.fen,
);
