import { Header } from '../../components/header/header';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { PieceColorType } from '@/app/types/chess-square.type';
import { Store } from '@ngrx/store';
import { UserSupabaseService } from '@/app/services/user-supabase.service';
import { AuthService } from '@/app/services/auth.service';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { START_FEN } from '@/app/constants/chess-game.constants';
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
  public chosenColor = signal<PieceColorType>('black');
  protected readonly router = inject(Router);
  protected readonly store = inject(Store);
  protected readonly authService = inject(AuthService);
  protected readonly userSupabaseService = inject(UserSupabaseService);
  protected readonly userId = this.authService.getUserData().user.id;
  protected phoneNumber =
    this.authService.getUserData().user.user_metadata.phone;
  protected lastSignInData =
    this.authService.getUserData().user.last_sign_in_at;

  protected setOrientation = effect(() => {
    const color = this.chosenColor();
    switch (color) {
      case 'black':
        this.store.dispatch(
          newGame({
            initialFen: START_FEN,
            orientation: 'black', // чёрные снизу, но ход белых
          }),
        );
        break;

      case 'white':
        this.store.dispatch(
          newGame({
            initialFen: START_FEN,
            orientation: 'white', // белые снизу, и тоже ход белых
          }),
        );
        break;
    }
  });

  protected userName = rxResource({
    params: () => this.userId,
    stream: ({ params }) =>
      from(this.userSupabaseService.fetchUserData(params)),
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

  protected goToGamePage(): void {
    this.router.navigate(['/game']).then();
  }
}
