import { createReducer, on } from '@ngrx/store';
import { authInitialState, type AuthState } from '../states/auth.state';
import { token } from '../actions/auth.actions';

export const authReducers = createReducer(
  authInitialState,

  on(
    token,
    (state, action): AuthState => ({
      ...state,
      token: action.token,
    }),
  ),
);
