import { createReducer, on } from '@ngrx/store';
import { initialUserState, type UserStateType } from '../states/user.state';
import { signInUser } from '../actions/user.actions';

export const userReducers = createReducer(
  initialUserState,

  on(
    signInUser,
    (state, action): UserStateType => ({
      ...state,
      user: action.user,
    }),
  ),
);
