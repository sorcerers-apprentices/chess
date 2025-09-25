import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserSupabaseService } from '@/app/services/user-supabase.service';
import { AuthService } from '@/app/services/auth.service';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import {
  CHOSEN_COLOR_TOKEN,
  START_FEN,
} from '@/app/constants/chess-game.constants';
import { newGame } from '@/app/store/actions/game.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    TranslatePipe,
    TuiButton,
    ReactiveFormsModule,
    DatePipe,
    TuiLoader,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly chosenColor = inject(CHOSEN_COLOR_TOKEN);
  protected readonly router = inject(Router);
  protected readonly store = inject(Store);
  protected readonly authService = inject(AuthService);
  protected readonly userSupabaseService = inject(UserSupabaseService);
  protected readonly userId = this.authService.getUserData().user.id;
  protected phoneNumber =
    this.authService.getUserData().user.user_metadata.phone;
  protected lastSignInData =
    this.authService.getUserData().user.last_sign_in_at;

  protected userName = rxResource({
    params: () => this.userId,
    stream: ({ params }) =>
      from(this.userSupabaseService.fetchUserData(params)).pipe(
        map((user) => user?.display_name),
      ),
  });

  protected userElo = rxResource({
    params: () => this.userId,
    stream: ({ params }) =>
      from(this.userSupabaseService.fetchUserData(params)).pipe(
        map((user) => user?.elo),
      ),
  });

  protected playedGamesCount = rxResource({
    params: () => this.userId,
    stream: ({ params }) =>
      from(this.userSupabaseService.fetchGamesCount(params)),
  });

  protected winedGamesCount = rxResource({
    params: () => this.userId,
    stream: ({ params }) =>
      from(this.userSupabaseService.fetchWinedGamesCount(params)),
  });

  protected setColor(event: Event): void {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      (target.value === 'black' || target.value === 'white')
    ) {
      this.chosenColor.set(target.value);
    }
  }

  protected playGame(): void {
    this.store.dispatch(
      newGame({
        initialFen: START_FEN,
        orientation: this.chosenColor(),
      }),
    );
  }
}
