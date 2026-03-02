import { createAction, props } from '@ngrx/store';
import type { UserType } from '../../types/sign-up.type';

export const signInUser = createAction(
  '[User] Sign In User',
  props<{ user: UserType }>(),
);
export const signUpUser = createAction('[User] Sign Up User');
export const logoutUser = createAction('[User] Logout User');

export const updateElo = createAction(
  '[User] Update Elo',
  props<{ elo: number }>(),
);
export const updateEloSuccess = createAction('[User] Update Elo Success');

export const incrementGamesPlayed = createAction(
  '[User] Increment Games Played',
  props<{ by?: number }>(),
);
