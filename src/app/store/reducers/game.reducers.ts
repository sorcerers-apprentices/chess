import { Chess } from 'chess.js';
import { createReducer, on } from '@ngrx/store';
import { newGame } from '@/app/store/actions/game.actions';
import { initialGameState } from '@/app/store/states/game.state';

export const gameReducers = createReducer(
  initialGameState,

  on(newGame, (state, action) => ({
    ...state,
    game: new Chess(action.initialFen),
  })),
);
