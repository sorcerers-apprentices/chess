import { Header } from '../../components/header/header';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe } from '@ngx-translate/core';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserSupabaseService } from '@/app/services/user-supabase.service';
import { AuthService } from '@/app/services/auth.service';
import { DatePipe } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { from, map } from 'rxjs';
import {
  CHOSEN_COLOR_TOKEN,
  START_FEN,
} from '@/app/constants/chess-game.constants';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@/app/services/game.service';
import {
  TuiTable,
  TuiTablePagination,
  type TuiTablePaginationEvent,
  TuiTableTbody,
  TuiTableTd,
  TuiTableTh,
  TuiTableThGroup,
  TuiTableTr,
} from '@taiga-ui/addon-table';

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
    TuiTableThGroup,
    TuiTableTh,
    TuiTablePagination,
    TuiTableTbody,
    TuiTableTr,
    TuiTableTd,
    TuiTable,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly chosenColor = inject(CHOSEN_COLOR_TOKEN);
  protected readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly store = inject(Store);
  protected readonly authService = inject(AuthService);
  protected readonly gameService = inject(GameService);
  protected readonly userSupabaseService = inject(UserSupabaseService);
  protected readonly userId = this.authService.getUserData().user.id;
  protected phoneNumber =
    this.authService.getUserData().user.user_metadata.phone;
  protected lastSignInData =
    this.authService.getUserData().user.last_sign_in_at;
  protected readonly size = signal(10);
  protected readonly page = signal(0);

  protected readonly routerParams = toSignal(this.activatedRoute.queryParams, {
    initialValue: this.activatedRoute.snapshot.queryParams,
  });
  protected readonly pageParamEffect = effect(() => {
    this.page.set(this.routerParams()['page'] ?? 0);
    this.size.set(this.routerParams()['size'] ?? 10);
  });

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

  protected columns = ['number', 'date', 'result', ''];

  protected usersGames = rxResource({
    params: () => ({
      userId: this.authService.getUserData().user.id,
      size: this.size(),
      offset: this.page() * this.size(),
    }),
    stream: ({ params }) => from(this.userSupabaseService.fetchGames(params)),
  });

  protected readonly loading = computed(() => !this.usersGames.value());

  protected readonly total = computed(
    () => this.usersGames.value()?.count ?? 0,
  );

  protected onPagination({ page, size }: TuiTablePaginationEvent): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page, size },
      queryParamsHandling: 'merge',
    });
  }

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
    this.gameService.newGame(START_FEN, this.chosenColor());
  }
}
