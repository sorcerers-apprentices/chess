import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/supabase/game-supabase.service';
import {
  gameApiErrorActions,
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
import { catchError, from, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '@/app/services/supabase/auth.service';
import type {
  GameDomainType,
  MoveRecordType,
} from '@/app/store/states/game.state';
import { Chess } from 'chess.js';
import { load } from '@/app/utilities/chess-piece';
import { Router } from '@angular/router';
import type { HistoryMoveVerbose } from '@/app/types/chess-type/chess-game.type';
import { toStoredMoveFromHistory } from '@/app/utilities/mapping-chess-move-class';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { concatLatestFrom } from '@ngrx/operators';
import { selectGameId } from '@/app/store/selectors/game.selectors';
import type { MoveDbInsert } from '@/app/types/supabase-type/supabase-move.type';
import { toMoveDbInsert } from '@/app/types/supabase-type/supabase-move.type';

@Injectable({
  providedIn: 'root',
})
export class GameEffects {
  private readonly api: GameSupabaseService = inject(GameSupabaseService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly actions$: Actions = inject(Actions);
  private readonly router: Router = inject(Router);
  private readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);

  private startGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(newGame),
      switchMap(({ initialFen, orientation }) =>
        from(
          this.api.createGame(
            this.authService.getUserData().user.id,
            orientation,
            initialFen,
          ),
        ).pipe(
          map((id) => {
            if (id === null) {
              return gameApiErrorActions.createGameFailed({
                error: 'Create game failed',
              });
            }
            return setGameId({ gameId: id });
          }),
          tap((action) => {
            if (action.type === setGameId.type) {
              void this.router.navigate([`/game/${action.gameId}`]);
            }
          }),
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Create game failed';
            return of(gameApiErrorActions.createGameFailed({ error: message }));
          }),
        ),
      ),
    );
  });

  private loadGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadGame),
      switchMap(({ gameId }) => {
        return from(this.api.loadGame(gameId)).pipe(
          map((game) => {
            if (game === null) {
              return gameApiErrorActions.loadGameFailed({
                error: 'Game not found',
              });
            }
            const chess = new Chess();
            const pgn = game.pgn;
            chess.loadPgn(pgn);
            const moves: HistoryMoveVerbose[] = chess.history({
              verbose: true,
            });

            const lastMove = moves.at(-1);
            const gameModel: GameDomainType = {
              pgn: chess.pgn(),
              pgnLast: game.pgn_last,
              fen: game.fen,
              id: game.id,
              moves: moves.map((move, index) => {
                const stored = toStoredMoveFromHistory(move);
                const record: MoveRecordType = {
                  move: stored,
                  fenAfter: stored.after,

                  // НОВОЕ — чтобы тип был валиден
                  ply: index + 1,
                  player_id: null,
                  is_check: false,
                  is_checkmate: false,
                };
                return record;
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
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Load game failed';
            return of(gameApiErrorActions.loadGameFailed({ error: message }));
          }),
        );
      }),
    );
  });

  private move$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(playMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(([{ moveRecord, pgn }, gameId]) => {
        if (gameId == null || gameId === '') {
          return of(
            gameApiErrorActions.moveFailed({
              error: 'Game id is missing in store',
            }),
          );
        }

        const chess = load(pgn);

        const insert: MoveDbInsert = toMoveDbInsert(gameId, moveRecord);

        return from(this.api.move(gameId, chess, moveRecord)).pipe(
          switchMap(() => from(this.api.insertMove(insert))),
          map(() => moveSuccess()),
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Move failed';
            return of(gameApiErrorActions.moveFailed({ error: message }));
          }),
        );
      }),
    );
  });

  private undoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undoMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(([, gameId]) => {
        if (gameId === null || gameId === '') {
          return of(
            gameApiErrorActions.undoMoveFailed({
              error: 'Game id is missing in store',
            }),
          );
        }
        return from(this.api.toggleMove(gameId)).pipe(
          map((result) => undoMoveSuccess(result)),
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Undo move failed';
            return of(gameApiErrorActions.undoMoveFailed({ error: message }));
          }),
        );
      }),
    );
  });

  private redoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(redoMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(([, gameId]) => {
        if (gameId === null || gameId === '') {
          return of(
            gameApiErrorActions.redoMoveFailed({
              error: 'Game id is missing in store',
            }),
          );
        }

        return from(this.api.toggleMove(gameId)).pipe(
          map((result) => redoMoveSuccess(result)),
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Redo move failed';
            return of(gameApiErrorActions.redoMoveFailed({ error: message }));
          }),
        );
      }),
    );
  });

  private GameOver$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(gameOver),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(([{ result, finalFen }, gameId]) => {
        if (gameId === null || gameId === '') {
          return of(
            gameApiErrorActions.gameOverFailed({
              error: 'Game id is missing in store',
            }),
          );
        }

        return from(this.api.gameOver(gameId, result, finalFen)).pipe(
          map(() => gameOverSuccess()),
          catchError((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Move failed';
            return of(gameApiErrorActions.gameOverFailed({ error: message }));
          }),
        );
      }),
    );
  });
}
