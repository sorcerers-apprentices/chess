import { createAction, props } from '@ngrx/store';
import type { User } from '../../types/sign-up.type';

export const signInUser = createAction(
  '[User] Sign in user',
  props<{ user: User }>(),
);
