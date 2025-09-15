import { createAction, props } from '@ngrx/store';

export const newGame = createAction(
  '[Chess] New Game',
  props<{ initialFen?: string }>(),
);
