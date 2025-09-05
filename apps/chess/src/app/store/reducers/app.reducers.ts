import { gameReducers } from './game.reducers';
import { routerReducer } from '@ngrx/router-store';
import type { AppStateType } from '../states/app.state';
import type { Action, ActionReducerMap } from '@ngrx/store';

export const appReducers: ActionReducerMap<AppStateType, Action> = {
  router: routerReducer,
  game: gameReducers,
};
