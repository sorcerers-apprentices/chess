import { createAction, props } from '@ngrx/store';
import type { GameResultType } from '@/app/services/game.service';
import type {
  GameDomainType,
  MoveRecordType,
} from '@/app/store/states/game.state';

export const newGame = createAction(
  '[Chess] New Game',
  props<{ initialFen: string; orientation: 'white' | 'black' }>(),
);
export const setGameId = createAction(
  '[Game] Set Id',
  props<{ gameId: string }>(),
);

export const loadGame = createAction(
  '[Chess] Load Game',
  props<{ gameId: string }>(),
);
export const loadGameSuccess = createAction(
  '[Chess] Load Game Success',
  props<{ game: GameDomainType }>(),
);

export const loadGameFailed = createAction(
  '[Chess] Load Game Failed',
  props<{ error: string }>(),
);

export const playMove = createAction(
  '[Game] Play Move',
  props<{ fen: string; moveRecord: MoveRecordType; pgn: string }>(),
);

export const moveSuccess = createAction('[Game] Move Success');

export const moveFailed = createAction(
  '[Game] Move Failed',
  props<{ error: string }>(),
);

export const undoMove = createAction('[Game] Undo Move');
export const undoMoveSuccess = createAction(
  '[Game] Undo Success',
  props<{ fen: string; pgn: string; pgn_last: string | null }>(),
);

export const redoMove = createAction('[Game] Redo Move');
export const redoMoveSuccess = createAction(
  '[Game] Redo Success',
  props<{ fen: string; pgn: string; pgn_last: string | null }>(),
);

export const gameOver = createAction(
  '[Game] Game Over',
  props<{ result: GameResultType; finalFen: string }>(),
);
export const gameOverSuccess = createAction('[Game] Game Over Success');
