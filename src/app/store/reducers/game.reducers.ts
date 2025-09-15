import {
  newGame,
  redoMove,
  undoMove,
  jumpToMove,
  recordMove,
} from '../actions/game.actions';
import { createReducer, on } from '@ngrx/store';
import { initialGameState } from '../states/game.state';
import type { GameStateType, ChessMoveType } from '../states/game.state';

export const gameReducers = createReducer(
  initialGameState,

  on(recordMove, (state, { move, color }): GameStateType => {
    const moveNumber = Math.floor(state.moves.length / 2) + 1;
    const newMove: ChessMoveType = {
      move,
      timestamp: Date.now(),
      moveNumber,
      color,
    };

    return {
      ...state,
      moves: [...state.moves, newMove],
      currentMoveIndex: state.moves.length,
    };
  }),

  on(
    newGame,
    (state, { initialFen }): GameStateType => ({
      ...initialGameState,
      initialFen:
        initialFen != null && initialFen !== '' ? initialFen : state.initialFen,
    }),
  ),

  on(
    undoMove,
    (state): GameStateType => ({
      ...state,
      currentMoveIndex: Math.max(-1, state.currentMoveIndex - 1),
    }),
  ),

  on(
    redoMove,
    (state): GameStateType => ({
      ...state,
      currentMoveIndex: Math.min(
        state.moves.length - 1,
        state.currentMoveIndex + 1,
      ),
    }),
  ),

  on(
    jumpToMove,
    (state, { index }): GameStateType => ({
      ...state,
      currentMoveIndex: Math.max(-1, Math.min(index, state.moves.length - 1)),
    }),
  ),
);
