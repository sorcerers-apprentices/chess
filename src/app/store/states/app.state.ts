import { initialGameState } from './game.state';
import type { GameStateType } from './game.state';
import type { RouterReducerState } from '@ngrx/router-store';
import { initialUserState } from '@/app/store/states/user.state';
import type { UserStateType } from '@/app/store/states/user.state';
import { initialFormsState } from '@/app/store/states/forms.state';
import type { FormsStateType } from '@/app/store/states/forms.state';

export type AppStateType = {
  router?: RouterReducerState;
  game: GameStateType;
  user: UserStateType;
  forms: FormsStateType;
};

export const initialAppState: AppStateType = {
  game: initialGameState,
  user: initialUserState,
  forms: initialFormsState,
};

export function getInitialState(): AppStateType {
  return initialAppState;
}
