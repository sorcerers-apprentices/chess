import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/supabase/game-supabase.service';
import {
  gameOver,
  gameOverSuccess,
  loadGame,
  loadGameSuccess,
  moveSuccess,
  newGame,
  playMove,
  redoMove,
  redoMoveSuccess,
  setGameId,
  undoMove,
  undoMoveSuccess,
} from '@/app/store/actions/game.actions';
import { filter, from, map, switchMap, tap } from 'rxjs';
import { AuthService } from '@/app/services/supabase/auth.service';
import type { GameStateType } from '@/app/store/states/game.state';
import { Chess } from 'chess.js';
import { load } from '@/app/utilities/chess-piece';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GameEffects {
  private readonly api = inject(GameSupabaseService);
  private readonly authService = inject(AuthService);
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  private startGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(newGame),
      switchMap(({ initialFen, orientation }) => {
        return from(
          this.api.createGame(
            this.authService.getUserData().user.id,
            orientation,
            initialFen,
          ),
        ).pipe(
          map((id) => setGameId({ gameId: id ?? '' })),
          tap((game) => {
            this.router.navigate([`/game/${game.gameId}`]).then();
          }),
        );
      }),
    );
  });

  private loadGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadGame),
      switchMap(({ gameId }) => {
        return from(this.api.loadGame(gameId)).pipe(
          filter((game) => game !== null),
          map((game) => {
            const chess = new Chess();
            const pgn = game.pgn;
            chess.loadPgn(pgn);
            const moves = chess.history({ verbose: true });
            const lastMove = chess.history({ verbose: true }).at(-1);
            const gameModel: GameStateType = {
              pgn: chess.pgn(),
              pgnLast: game.pgn_last,
              fen: game.fen,
              id: game.id,
              moves: moves.map((move) => {
                return {
                  uci: `${move.from}${move.to}${move.promotion ?? ''}`,
                  san: move.san,
                  move: move,
                  fenAfter: move.after,
                  timestamp: game.timestamp,
                };
              }),
              undoneMoves: [],
              lastMove: lastMove
                ? { from: lastMove.from, to: lastMove.to }
                : null,
              orientation: game.player_color,
              finished: game.finished,
              result:
                game.result === 'DRAW'
                  ? { winner: null, draw: true }
                  : game.result === 'WHITE_WINS'
                    ? { winner: 'white', draw: false }
                    : game.result === 'BLACK_WINS'
                      ? { winner: 'black', draw: false }
                      : { winner: null, draw: false },
              finalFen: game.fen_final,
            };
            return loadGameSuccess({ game: gameModel });
          }),
        );
      }),
    );
  });

  private move$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(playMove),
      switchMap(async ({ moveRecord, pgn }) => {
        await this.api.move(load(pgn), moveRecord);
        return moveSuccess();
      }),
    );
  });

  private undoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undoMove),
      switchMap(async () => {
        const result = await this.api.undoMove();
        return undoMoveSuccess(result);
      }),
    );
  });

  private redoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(redoMove),
      switchMap(async () => {
        const result = await this.api.undoMove();
        return redoMoveSuccess(result);
      }),
    );
  });

  private GameOver$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(gameOver),
      switchMap(async ({ result, finalFen }) => {
        await this.api.gameOver(result, finalFen);
        return gameOverSuccess();
      }),
    );
  });
}
