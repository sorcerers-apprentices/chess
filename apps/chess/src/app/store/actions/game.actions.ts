import { createAction, props } from '@ngrx/store';

export const recordMove = createAction('[Game] Record Move', props<{ move: string }>());
