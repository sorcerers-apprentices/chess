import { createReducer, on } from '@ngrx/store';
import { userInitialState, type UserState } from '../states/user.state';
import { signInUser } from '../actions/user.actions';

export const userReducers = createReducer(
  userInitialState,

  on(
    signInUser,
    (state, action): UserState => ({
      ...state,
      user: action.user,
    }),
  ),
);
