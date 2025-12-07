import { Header } from '../../components/header/header';
import type { WritableSignal } from '@angular/core';
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
import {
  TuiButton,
  TuiFormatDatePipe,
  TuiLoader,
  TuiScrollbar,
} from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserSupabaseService } from '@/app/services/supabase/user-supabase.service';
import { AuthService } from '@/app/services/supabase/auth.service';
import { AsyncPipe, DatePipe } from '@angular/common';
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
import { loadGame } from '@/app/store/actions/game.actions';
import type { GameModel } from '@/app/types/supabase-game.type';
import type { AppStateType } from '@/app/store/states/app.state';
import type { GameDifficulty } from '@/app/types/stockfish.type';
import { DIFFICULTY_VALUES } from '@/app/types/stockfish.type';
import { DIFFICULTY_OPTIONS } from '@/app/types/stockfish.type';
import { ENGINE_DEFAULT_DIFFICULTY } from '@/app/constants/stockfish.constans';
import { EngineService } from '@/app/services/stockfish/engine.service';
import type { PieceColorType } from '@/app/types/chess-square.type';

type UsersGamesPage = {
  games: GameModel[];
  count: number;
};

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
    TuiFormatDatePipe,
    AsyncPipe,
    TuiScrollbar,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  // 1. DI services
  public readonly chosenColor = inject(CHOSEN_COLOR_TOKEN);
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);
  private readonly authService: AuthService = inject(AuthService);
  private readonly gameService: GameService = inject(GameService);
  private readonly userSupabaseService: UserSupabaseService =
    inject(UserSupabaseService);
  private readonly engineService: EngineService = inject(EngineService);

  // 2. Basic user info
  protected readonly userId: string = this.authService.getUserData().user.id;
  protected phoneNumber: string =
    this.authService.getUserData().user.user_metadata.phone;
  protected lastSignInData =
    this.authService.getUserData().user.last_sign_in_at;

  // 3. Pagination & router params
  protected readonly size: WritableSignal<number> = signal(10);
  protected readonly page: WritableSignal<number> = signal(0);
  protected readonly routerParams = toSignal(this.activatedRoute.queryParams, {
    initialValue: this.activatedRoute.snapshot.queryParams,
  });

  // 4. User resources (async data)
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

  // 5. Games table data
  protected columns = ['number', 'date', 'result', ''];
  protected usersGames = rxResource({
    params: () => {
      const params = {
        userId: this.authService.getUserData().user.id,
        size: this.size(),
        offset: this.page() * this.size(),
      };
      return params;
    },
    stream: ({ params }) => from(this.userSupabaseService.fetchGames(params)),
  });
  protected readonly usersGamesView = signal<UsersGamesPage>({
    games: [],
    count: 0,
  });
  protected readonly tableData = computed(() => this.usersGamesView().games);
  protected readonly total = computed(() => this.usersGamesView().count);

  // 6. Difficulty settings
  protected readonly difficulties = DIFFICULTY_VALUES.map((value) => ({
    value,
    labelKey: DIFFICULTY_OPTIONS[value].labelKey,
    descriptionKey: DIFFICULTY_OPTIONS[value].descriptionKey,
  }));
  protected readonly selectedDifficulty = signal<GameDifficulty>(
    ENGINE_DEFAULT_DIFFICULTY,
  );

  // 7. Effects
  protected readonly pageParamEffect = effect(() => {
    const params = this.routerParams();

    const pageIndexParam = Number(params['page'] ?? 0);
    const sizeParam = Number(params['size'] ?? 10);

    this.page.set(Number.isNaN(pageIndexParam) ? 0 : pageIndexParam);
    this.size.set(Number.isNaN(sizeParam) ? 10 : sizeParam);
  });
  protected readonly updateUsersGamesViewEffect = effect(() => {
    const value = this.usersGames.value(); // может быть undefined во время загрузки

    if (value) {
      this.usersGamesView.set(value);
    }
  });

  // 8. Methods
  public playGame(): void {
    const difficulty: GameDifficulty = this.selectedDifficulty();
    const color: PieceColorType = this.chosenColor();

    // готовим движок к новой партии (сложность + ucinewgame + сброс сигналов)
    this.engineService.engineForNewGame(difficulty);

    //запускаем новую игру в логике Chess / стора
    this.gameService.newGame(START_FEN, color);
  }

  protected onDifficultyChange(difficulty: GameDifficulty): void {
    this.selectedDifficulty.set(difficulty);
  }

  protected onPagination({ page, size }: TuiTablePaginationEvent): void {
    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { page, size },
        queryParamsHandling: 'merge',
      })
      .then();
  }

  protected replyGame(id: string): void {
    this.router.navigate(['game', id]).then();
    this.store.dispatch(loadGame({ gameId: id }));
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
}
