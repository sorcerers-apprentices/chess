import { initialGameState } from './game.state';
import type { GameStateType } from './game.state';
import type { RouterReducerState } from '@ngrx/router-store';
import { initialUserState } from '@/app/store/states/user.state';
import type { UserStateType } from '@/app/store/states/user.state';

export type AppStateType = {
  router?: RouterReducerState;
  game: GameStateType;
  user: UserStateType;
};

export const initialAppState: AppStateType = {
  game: initialGameState,
  user: initialUserState,
};

export function getInitialState(): AppStateType {
  return initialAppState;
}
