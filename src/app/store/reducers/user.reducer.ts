import {
  updateElo,
  signInUser,
  logoutUser,
  signUpUser,
  incrementGamesPlayed,
} from '../actions/user.actions';
import { createReducer, on } from '@ngrx/store';
import { initialUserState, type UserStateType } from '../states/user.state';

export const userReducers = createReducer(
  initialUserState,

  on(
    signInUser,
    (state, action): UserStateType => ({
      ...state,
      isAuth: true,
      user: action.user,
    }),
  ),

  on(
    signUpUser,
    (state): UserStateType => ({
      ...state,
      isAuth: false,
      user: null,
    }),
  ),

  on(
    logoutUser,
    (state): UserStateType => ({
      ...state,
      isAuth: false,
      user: null,
      elo: 0,
    }),
  ),

  on(
    updateElo,
    (state, { elo }): UserStateType => ({
      ...state,
      elo,
    }),
  ),

  on(
    incrementGamesPlayed,
    (state, { by = 1 }): UserStateType => ({
      ...state,
      gamesPlayed: Math.max(0, state.gamesPlayed + by),
    }),
  ),
);
