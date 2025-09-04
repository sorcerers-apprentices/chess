import { createSelector } from '@ngrx/store';
import { AppStateType } from '../states/app.state';
import { GameStateType } from '../states/game.state';

const selectGame = (state: AppStateType): GameStateType => state.game;

export const selectGameMoves = createSelector(
  selectGame,
  (state: GameStateType) => state.gameMoves,
);
