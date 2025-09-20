import { createAction, props } from '@ngrx/store';
import type { GameResultType } from '@/app/services/game.service';
import type { MoveRecordType } from '@/app/store/states/game.state';

export const newGame = createAction(
  '[Chess] New Game',
  props<{ initialFen: string; orientation?: 'white' | 'black' }>(),
);

export const setGameId = createAction(
  '[Game] Set Id',
  props<{ gameId: string }>(),
);

export const gameOver = createAction(
  '[Game] Game Over',
  props<{ result: GameResultType; finalFen: string }>(),
);

export const playMove = createAction(
  '[Game] Play Move',
  props<{ fen: string; moveRecord: MoveRecordType }>(),
);

export const moveSuccess = createAction(
  '[Game] Move Success',
  props<{ fen: string; moveRecord: MoveRecordType }>(),
);

export const undoMove = createAction('[Game] Undo Move');
export const redoMove = createAction('[Game] Redo Move');
