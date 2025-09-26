import type {
  GameStateType,
  MoveRecordType,
} from '@/app/store/states/game.state';
import { createSelector } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { parseActiveColor } from '@/app/utilities/chess-piece';

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

export const selectMoveCount = createSelector(
  selectMoves,
  (moves) => moves.length,
);

export const selectUndoneCount = createSelector(
  selectUndoneMoves,
  (moves) => moves.length,
);

export const selectPgnLast = createSelector(
  selectGameState,
  (state) => state.pgnLast,
);

export const selectIsGameOver = createSelector(
  selectGameState,
  (state) => state.finished,
);

export const selectOrientation = createSelector(
  selectGameState,
  (state) => state.orientation,
);

// логика возврата ходов user
//---------------

export const selectFen = createSelector(selectGameState, (state) => state.fen);

export const selectActiveColor = createSelector(
  selectFen,
  (fen) => parseActiveColor(fen), // 'w' | 'b'
);

// Чей сейчас ход
export const selectIsPlayersTurn = createSelector(
  selectActiveColor,
  selectOrientation, // 'white' | 'black'
  (active, orientation) =>
    orientation === 'white' ? active === 'w' : active === 'b',
);

export const selectCanUndo = createSelector(
  selectMoveCount,
  selectIsGameOver,
  selectIsPlayersTurn,
  (moveCount, finished, isPlayersTurn) =>
    moveCount > 0 && !finished && !isPlayersTurn,
);

export const selectCanRedo = createSelector(
  selectUndoneCount,
  selectIsGameOver,
  selectIsPlayersTurn,
  (undoneCount, finished, isPlayersTurn) =>
    undoneCount > 0 && !finished && isPlayersTurn,
);

//---------------

export const selectLastMove = createSelector(
  selectGameState,
  (state) => state.lastMove,
);

export const selectGameId = createSelector(
  selectGameState,
  (state) => state.id,
);
