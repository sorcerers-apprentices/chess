import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs';
import { updateElo, updateEloSuccess } from '@/app/store/actions/user.actions';
import { AuthService } from '@/app/services/supabase/auth.service';
import { GameSupabaseService } from '@/app/services/supabase/game-supabase.service';

@Injectable({
  providedIn: 'root',
})
export class UserEffects {
  private readonly api = inject(GameSupabaseService);
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  private UpdateElo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateElo),
      switchMap(async ({ elo }) => {
        await this.api.setElo(elo, this.authService.getUserData().user.id);
        return updateEloSuccess();
      }),
    );
  });
}
