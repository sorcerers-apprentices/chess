import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/game-supabase.service';
import {
  moveSuccess,
  newGame,
  playMove,
  setGameId,
  undoMove,
  undoMoveSuccess,
} from '@/app/store/actions/game.actions';
import { from, map, switchMap } from 'rxjs';
import { AuthService } from '@/app/services/auth.service';
import type { BoardCell, MoveModel } from '@/app/types/supabase-game.type';

@Injectable({
  providedIn: 'root',
})
export class GameEffects {
  private readonly api = inject(GameSupabaseService);
  private readonly AuthService = inject(AuthService);
  private readonly actions$ = inject(Actions);
  private readonly userId = this.AuthService.getUserData().user.id;

  private startGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(newGame),
      switchMap(({ orientation }) => {
        return from(this.api.createGame(this.userId, orientation)).pipe(
          map((id) => setGameId({ gameId: id ?? '' })),
        );
      }),
    );
  });

  // private loadGame$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(loadGame),
  //     switchMap(({ gameId }) => {
  //       return from(this.api.fetchGame(gameId)).pipe(
  //         filter((game) => game !== null),
  //         map((game) => {
  //           const moves = await this.api.fetchMoves(gameId)
  //           const gameModel: GameStateType = {
  //             fen: game.fen,
  //             id: gameId,
  //             moves: moves.map((move) => {
  //
  //             }),
  //             undoneMoves: MoveRecordType[];
  //             lastMove: game.lastMoveFrom ? { from: game.lastMoveFrom; to: game.lastMoveTo } : null,
  //             orientation: game.playerColor,
  //             clocks?: { white: number; black: number } | null;
  //             finished: game.finished,
  //             result: GameResultType | null;
  //             finalFen?: game.finalFen
  //           }
  //           loadGameSuccess({ game })
  //         }),
  //       );
  //     }),
  //   );
  // });

  private move$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(playMove),
      switchMap(async ({ fen, moveRecord }) => {
        const gameId = this.api.getGameId();
        const from: BoardCell = {
          file: moveRecord.move.from[0],
          rank: +moveRecord.move.from[1],
        };
        const to: BoardCell = {
          file: moveRecord.move.to[0],
          rank: +moveRecord.move.to[1],
        };
        const move: MoveModel = {
          gameId: gameId,
          from: from,
          to: to,
          uci: moveRecord.uci,
          san: moveRecord.san,
          fenAfter: moveRecord.fenAfter,
          timestamp: moveRecord.timestamp,
          piece: moveRecord.move.piece,
          captured: moveRecord.move.captured ?? '',
          promotion: moveRecord.move.promotion ?? '',
        };
        await this.api.move(move);
        return moveSuccess({ fen, moveRecord });
      }),
    );
  });

  private undoMove$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undoMove),
      switchMap(async () => {
        const gameId = this.api.getGameId();
        await this.api.undoMove(gameId);
        return undoMoveSuccess();
      }),
    );
  });
}
