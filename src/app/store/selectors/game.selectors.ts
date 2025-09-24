import type {
  GameStateType,
  MoveRecordType,
} from '@/app/store/states/game.state';
import { createSelector } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';

const selectGameState = (state: AppStateType): GameStateType => state.game;

export const selectChess = createSelector(
  selectGameState,
  (state) => state.pgn,
);

export const selectMoves = createSelector(
  selectGameState,
  (state): MoveRecordType[] => state.moves,
);

export const selectUndoneMoves = createSelector(
  selectGameState,
  (state): MoveRecordType[] => state.undoneMoves,
);

export const selectLastMove = createSelector(
  selectGameState,
  (state) => state.lastMove,
);

export const selectMoveCount = createSelector(
  selectMoves,
  (moves) => moves.length,
);

export const selectCanUndo = createSelector(
  selectMoves,
  (moves) => moves.length > 0,
);

export const selectCanRedo = createSelector(
  selectUndoneMoves,
  (undoneMoves) => undoneMoves.length > 0,
);

export const selectOrientation = createSelector(
  selectGameState,
  (state) => state.orientation,
);
