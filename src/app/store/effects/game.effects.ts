import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GameSupabaseService } from '@/app/services/game-supabase.service';
import { newGame, setGameId } from '@/app/store/actions/game.actions';
import { from, map, switchMap } from 'rxjs';
import { DEFAULT_WHITE_POSITION } from '@/app/constants/chess-game.constants';
import { AuthService } from '@/app/services/auth.service';

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
}
