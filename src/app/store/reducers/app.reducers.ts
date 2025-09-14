import { gameReducers } from './game.reducers';
import { routerReducer } from '@ngrx/router-store';
import type { AppStateType } from '../states/app.state';
import type { Action, ActionReducerMap } from '@ngrx/store';
import { userReducers } from '@/app/store/reducers/user.reducer';
import { formsReducers } from '@/app/store/reducers/forms.reducers';

export const appReducers: ActionReducerMap<AppStateType, Action> = {
  router: routerReducer,
  game: gameReducers,
  user: userReducers,
  forms: formsReducers,
};
