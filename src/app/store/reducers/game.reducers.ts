import {
  gameOver,
  loadGameSuccess,
  newGame,
  playMove,
  redoMove,
  undoMove,
} from '@/app/store/actions/game.actions';
import { DEFAULT_POSITION } from 'chess.js';
import { createReducer, on } from '@ngrx/store';
import { initialGameState } from '@/app/store/states/game.state';

export const gameReducers = createReducer(
  initialGameState,

  on(newGame, (state, { initialFen, orientation }) => ({
    ...state,
    fen: initialFen ?? state.fen,
    moves: [],
    undoneMoves: [],
    lastMove: null,
    orientation: orientation ?? state.orientation, // ← берём из payload или оставляем как было
    clocks: null,
    finished: false,
    result: null,
    finalFen: null,
  })),

  on(loadGameSuccess, (_state, { game }) => ({
    ...game,
  })),

  on(playMove, (state, { fen, moveRecord, pgn }) => ({
    ...state,
    pgn,
    fen,
    moves: [...state.moves, moveRecord],
    undoneMoves: [],
    lastMove: { from: moveRecord.move.from, to: moveRecord.move.to },
  })),

  on(undoMove, (state) => {
    if (state.moves.length === 0) return state;

    const newMoves = state.moves.slice(0, -1);
    const undoneMove = state.moves[state.moves.length - 1];
    const newFen = newMoves.length
      ? newMoves[newMoves.length - 1].fenAfter
      : DEFAULT_POSITION;

    return {
      ...state,
      fen: newFen,
      moves: newMoves,
      undoneMoves: [undoneMove, ...state.undoneMoves],
      lastMove: newMoves.length
        ? {
            from: newMoves[newMoves.length - 1].move.from,
            to: newMoves[newMoves.length - 1].move.to,
          }
        : null,
    };
  }),

  on(redoMove, (state) => {
    if (state.undoneMoves.length === 0) return state;

    const [moveToRedo, ...restUndone] = state.undoneMoves;

    return {
      ...state,
      fen: moveToRedo.fenAfter,
      moves: [...state.moves, moveToRedo],
      undoneMoves: restUndone,
      lastMove: {
        from: moveToRedo.move.from,
        to: moveToRedo.move.to,
      },
    };
  }),

  on(gameOver, (state, { result, finalFen }) => ({
    ...state,
    finished: true,
    result,
    finalFen,
  })),
);
