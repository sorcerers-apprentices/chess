import { createReducer, on } from '@ngrx/store';
import { logoutUser, signInUser, signUpUser } from '../actions/user.actions';
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
);
