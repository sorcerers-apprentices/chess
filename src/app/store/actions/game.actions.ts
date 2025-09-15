import { createAction, props } from '@ngrx/store';

export const newGame = createAction(
  '[Game] New Game',
  props<{ initialFen?: string }>(),
);

export const recordMove = createAction(
  '[Game] Record Move',
  props<{ move: string; color: 'white' | 'black' }>(),
);
export const undoMove = createAction('[Game] Undo Move');
export const redoMove = createAction('[Game] Redo Move');
export const jumpToMove = createAction(
  '[Game] Jump To Move',
  props<{ index: number }>(),
);
