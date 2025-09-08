import { createAction, props } from '@ngrx/store';

export const token = createAction('[Auth] Token', props<{ token: string }>());
