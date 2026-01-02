import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/supabase/game-supabase.service';
import {
  gameOver,
  gameOverSuccess,
  loadGame,
  loadGameFailed,
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
import { catchError, EMPTY, from, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '@/app/services/supabase/auth.service';
import type {
  GameDomainType,
  MoveRecordType,
} from '@/app/store/states/game.state';
import { Chess } from 'chess.js';
import { load } from '@/app/utilities/chess-piece';
import { Router } from '@angular/router';
import type { HistoryMoveVerbose } from '@/app/types/store-game.type';
import { toStoredMoveFromHistory } from '@/app/utilities/transformation-chess-move-class';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { concatLatestFrom } from '@ngrx/operators';
import { selectGameId } from '@/app/store/selectors/game.selectors';

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
          map((game) => {
            if (game === null) {
              return loadGameFailed({ error: 'Game not found' });
            }
            const chess = new Chess();
            const pgn = game.pgn;
            chess.loadPgn(pgn);
            const moves: HistoryMoveVerbose[] = chess.history({
              verbose: true,
            });

            const lastMove = chess.history({ verbose: true }).at(-1);
            const gameModel: GameDomainType = {
              pgn: chess.pgn(),
              pgnLast: game.pgn_last,
              fen: game.fen,
              id: game.id,
              moves: moves.map((move) => {
                const stored = toStoredMoveFromHistory(move);
                const record: MoveRecordType = {
                  move: stored,
                  fenAfter: stored.after,
                  timestamp: game.timestamp,
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
            return of(loadGameFailed({ error: message }));
          }),
        );
      }),
    );
  });

  private move$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(playMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(async ([{ moveRecord, pgn }, gameId]) => {
        if (!gameId) {
          throw new Error('Game id is missing in store');
        }

        await this.api.move(gameId, load(pgn), moveRecord);
        return moveSuccess();
      }),
    );
  });

  private undoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undoMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(async ([, gameId]) => {
        if (!gameId) {
          // пока нет undoMoveFailed — можно бросить, но лучше action
          throw new Error('Game id is missing in store');
        }
        const result = await this.api.toggleMove(gameId);
        return undoMoveSuccess(result);
      }),
    );
  });

  private redoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(redoMove),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(async ([, gameId]) => {
        if (!gameId) {
          // пока нет undoMoveFailed — можно бросить, но лучше action
          throw new Error('Game id is missing in store');
        }
        const result = await this.api.toggleMove(gameId);
        return redoMoveSuccess(result);
      }),
    );
  });

  private GameOver$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(gameOver),
      concatLatestFrom(() => this.store.select(selectGameId)),
      switchMap(([{ result, finalFen }, gameId]) => {
        if (!gameId) {
          // пока нет GameOverFailed — можно бросить, но лучше action
          throw new Error('Game id is missing in store');
        }
        return from(this.api.gameOver(gameId, result, finalFen)).pipe(
          map(() => gameOverSuccess()),
          catchError((err) => {
            console.error(
              'Game over failed:',
              err instanceof Error ? err.message : err,
            );
            return EMPTY;
          }),
        );
      }),
    );
  });
}
