import type { RouterReducerState } from '@ngrx/router-store';
import type { GameStateType } from './game.state';
import { initialGameState } from './game.state';

export type AppStateType = {
  router?: RouterReducerState;
  game: GameStateType;
};

export const initialAppState: AppStateType = {
  game: initialGameState,
};

export function getInitialState(): AppStateType {
  return initialAppState;
}
