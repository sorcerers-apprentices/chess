import { createAction, props } from '@ngrx/store';

export const writeLogin = createAction(
  '[Forms] Write Login',
  props<{ login: string }>(),
);
export const writePassword = createAction(
  '[Forms] Write Password',
  props<{ password: string }>(),
);
export const submitLoginForm = createAction('[Forms] Submit Login Form');
