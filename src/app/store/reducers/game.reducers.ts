import {
  gameApiErrorActions,
  gameOver,
  loadGame,
  loadGameSuccess,
  newGame,
  playMove,
  redoMove,
  redoMoveSuccess,
  setGameId,
  undoMove,
  undoMoveSuccess,
} from '@/app/store/actions/game.actions';
import { Chess } from 'chess.js';
import { createReducer, on } from '@ngrx/store';
import type { GameStateType } from '@/app/store/states/game.state';
import { initialGameState } from '@/app/store/states/game.state';
import { DEFAULT_POSITION_FEN } from '@/app/constants/chess-game.constants';

const apiErrorFailed = (
  state: GameStateType,
  { error }: { error: string },
): GameStateType => ({
  ...state,
  loading: false,
  error,
});

export const gameReducers = createReducer(
  initialGameState,

  on(newGame, (state, { initialFen, orientation }) => {
    const chess = new Chess();
    if (initialFen) {
      chess.load(initialFen);
    } else {
      chess.load(DEFAULT_POSITION_FEN);
    }
    return {
      ...state,
      fen: chess.fen(),
      pgnLast: null,
      pgn: chess.pgn(),
      id: '',
      moves: [],
      undoneMoves: [],
      lastMove: null,
      orientation: orientation ?? state.orientation,
      clocks: null,
      finished: false,
      result: null,
      finalFen: null,
      loading: false,
      error: null,
    };
  }),

  on(setGameId, (state, { gameId }) => ({
    ...state,
    id: gameId,
  })),

  on(loadGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loadGameSuccess, (state, { game }) => ({
    ...state,
    ...game,
    pgnLast: game.pgnLast ?? null,
    loading: false,
    error: null,
  })),

  on(playMove, (state, { fen, moveRecord, pgn }) => {
    if (state.finished) return state; // игра закончена — ходы игнорируем
    return {
      ...state,
      pgn,
      pgnLast: null,
      fen,
      moves: [...state.moves, moveRecord],
      undoneMoves: [],
      lastMove: { from: moveRecord.move.from, to: moveRecord.move.to },
    };
  }),

  on(undoMove, (state) => {
    if (state.moves.length === 0) return state;

    const newMoves = state.moves.slice(0, -1);
    const undoneMove = state.moves[state.moves.length - 1];
    const newFen = newMoves.length
      ? newMoves[newMoves.length - 1].fenAfter
      : DEFAULT_POSITION_FEN;

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

  on(undoMoveSuccess, (state, { fen, pgn, pgn_last }) => ({
    ...state,
    fen,
    pgn,
    pgnLast: pgn_last,
  })),

  on(redoMoveSuccess, (state, { fen, pgn, pgn_last }) => ({
    ...state,
    fen,
    pgn,
    pgnLast: pgn_last,
  })),

  on(gameOver, (state, { result, finalFen }) => ({
    ...state,
    finished: true,
    result,
    finalFen,
  })),

  on(gameApiErrorActions.createGameFailed, apiErrorFailed),
  on(gameApiErrorActions.loadGameFailed, apiErrorFailed),
  on(gameApiErrorActions.moveFailed, apiErrorFailed),
  on(gameApiErrorActions.undoMoveFailed, apiErrorFailed),
  on(gameApiErrorActions.redoMoveFailed, apiErrorFailed),
  on(gameApiErrorActions.gameOverFailed, apiErrorFailed),
);
