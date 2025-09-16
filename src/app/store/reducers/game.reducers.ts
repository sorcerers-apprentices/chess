import { DEFAULT_POSITION } from 'chess.js';
import { createReducer, on } from '@ngrx/store';
import { initialGameState } from '@/app/store/states/game.state';
import { newGame, playMove } from '@/app/store/actions/game.actions';

export const gameReducers = createReducer(
  initialGameState,

  on(newGame, (state, { initialFen }) => ({
    ...state,
    fen: initialFen ?? DEFAULT_POSITION,
  })),

  on(playMove, (state, { fen }) => ({
    ...state,
    fen: fen,
  })),
);
