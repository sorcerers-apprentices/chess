import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/game-supabase.service';
import {
  moveSuccess,
  newGame,
  playMove,
  setGameId,
} from '@/app/store/actions/game.actions';
import { from, map, switchMap } from 'rxjs';
import { DEFAULT_WHITE_POSITION } from '@/app/constants/chess-game.constants';
import { AuthService } from '@/app/services/auth.service';
import type { BoardCell, MoveModel } from '@/app/types/supabase-game.type';

@Injectable({
  providedIn: 'root',
})
export class GameEffects {
  private readonly api = inject(GameSupabaseService);
  private readonly AuthService = inject(AuthService);
  private readonly actions$ = inject(Actions);
  private readonly UserId = this.AuthService.getUserData().user.id;

  private startGame$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(newGame),
      switchMap(({ initialFen }) => {
        if (initialFen === DEFAULT_WHITE_POSITION) {
          const whitePlayerId = this.UserId;
          const blackPlayerId = '';
          return from(this.api.createGame(whitePlayerId, blackPlayerId)).pipe(
            map((id) => setGameId({ gameId: id ?? '' })),
          );
        } else {
          const whitePlayerId = '';
          const blackPlayerId = this.UserId;
          return from(this.api.createGame(whitePlayerId, blackPlayerId)).pipe(
            map((id) => setGameId({ gameId: id ?? '' })),
          );
        }
      }),
    );
  });

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
}
