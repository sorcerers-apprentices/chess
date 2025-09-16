import { createAction, props } from '@ngrx/store';

export const newGame = createAction(
  '[Chess] New Game',
  props<{ initialFen?: string }>(),
);

export const playMove = createAction(
  '[Chess] Play Move',
  props<{ fen: string }>(),
);
