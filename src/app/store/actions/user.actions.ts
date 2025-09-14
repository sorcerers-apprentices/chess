import { createAction, props } from '@ngrx/store';
import type { UserType } from '../../types/sign-up.type';

export const signInUser = createAction(
  '[User] Sign in user',
  props<{ user: UserType }>(),
);
