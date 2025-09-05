import { createReducer, on } from '@ngrx/store';
import type { GameStateType } from '../states/game.state';
import { initialGameState } from '../states/game.state';
import { recordMove } from '../actions/game.actions';

export const gameReducers = createReducer(
  initialGameState,

  on(
    recordMove,
    (state, action): GameStateType => ({
      ...state,
      gameMoves: [...state.gameMoves, action.move],
    }),
  ),
);
