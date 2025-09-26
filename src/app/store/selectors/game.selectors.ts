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

export const selectLastMove = createSelector(
  selectGameState,
  (state) => state.lastMove,
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

// 1) FEN и active color
export const selectFen = createSelector(selectGameState, (s) => s.fen);

// ВАЖНО: импортни свой util
// import { parseActiveColor } from '.../utils/chess-fen'; // путь как у тебя

export const selectActiveColor = createSelector(
  selectFen,
  (fen) => parseActiveColor(fen), // 'w' | 'b'
);

// 2) Чей сейчас ход с точки зрения игрока
export const selectIsPlayersTurn = createSelector(
  selectActiveColor,
  selectOrientation, // 'white' | 'black'
  (active, orientation) =>
    orientation === 'white' ? active === 'w' : active === 'b',
);

export const selectCanUndo = createSelector(
  selectMoveCount,
  selectIsGameOver,
  (moveCount, finished) => moveCount > 0 && !finished,
);

export const selectCanRedo = createSelector(
  selectUndoneCount,
  selectIsGameOver,
  (undoneCount, finished) => undoneCount > 0 && !finished,
);

export const selectGameId = createSelector(
  selectGameState,
  (state) => state.id,
);
