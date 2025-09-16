import { DEFAULT_POSITION } from 'chess.js';
import { createReducer, on } from '@ngrx/store';
import { newGame } from '@/app/store/actions/game.actions';
import { initialGameState } from '@/app/store/states/game.state';

export const gameReducers = createReducer(
  initialGameState,

  on(newGame, (state, { initialFen }) => ({
    ...state,
    fen: initialFen ?? DEFAULT_POSITION,
  })),
);
