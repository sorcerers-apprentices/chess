import { createAction, props } from '@ngrx/store';
import type { UserType } from '../../types/sign-up.type';

export const signInUser = createAction(
  '[User] Sign In User',
  props<{ user: UserType }>(),
);
export const signUpUser = createAction('[User] Sign Up User');

export const logoutUser = createAction('[User] Logout User');
