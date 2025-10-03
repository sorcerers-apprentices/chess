import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import {
  TUI_DARK_MODE,
  TuiDataList,
  TuiDataListComponent,
  TuiOptGroup,
} from '@taiga-ui/core';
import { Router } from '@angular/router';
import { TuiSwitch } from '@taiga-ui/kit';
import type { RoutePathValue } from '../../app.routes';
import { RoutePath } from '../../app.routes';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LANGUAGE_KEY,
  LANGUAGE_TOKEN,
  LanguageService,
} from '@/app/services/language.service';
import { GAME_ID, LOCAL_STORAGE_KEY } from '@/app/constants/auth.constants';
import { FormsModule } from '@angular/forms';
import { logoutUser } from '@/app/store/actions/user.actions';
import { Store } from '@ngrx/store';
import {
  CHOSEN_COLOR_TOKEN,
  START_FEN,
} from '@/app/constants/chess-game.constants';
import type { AppStateType } from '@/app/store/states/app.state';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import { GameService } from '@/app/services/game.service';
import { PlayerTimerService } from '@/app/services/player-timer.service';

type SidebarItemType = {
  nameKey: string;
  route: RoutePathValue;
};

type SidebarMapType = Record<string, SidebarItemType[]>;

@Component({
  selector: 'app-sidebar',
  imports: [
    TuiDataListComponent,
    TuiOptGroup,
    TuiSwitch,
    TranslatePipe,
    FormsModule,
    TuiDataList,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly language = inject(LANGUAGE_TOKEN);
  protected readonly chosenColor = inject(CHOSEN_COLOR_TOKEN);
  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly translate = inject(LanguageService);
  protected readonly gameService = inject(GameService);
  protected readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);
  protected readonly timer = inject(PlayerTimerService);
  protected token = localStorage.getItem(LOCAL_STORAGE_KEY);

  protected langEn = linkedSignal(() => this.language() === 'en');
  protected langEffect = effect(() =>
    this.language.set(this.langEn() ? 'en' : 'ru'),
  );

  protected readonly sidebarMenu = signal<SidebarMapType>({
    'sidebar.game': [
      { nameKey: 'sidebar.newGame', route: RoutePath['game/:id'] },
      { nameKey: 'sidebar.homePage', route: RoutePath['home'] },
    ],
    'sidebar.analysis': [
      { nameKey: 'sidebar.analysisBoard', route: RoutePath.main },
      { nameKey: 'sidebar.rating', route: RoutePath.rating },
      { nameKey: 'sidebar.about', route: RoutePath.about },
    ],
    'sidebar.settings': [
      { nameKey: 'sidebar.logout', route: RoutePath.signin },
    ],
  });

  protected readonly sidebarGroups = computed(() =>
    Object.entries(this.sidebarMenu()).map(([key, value]) => ({ key, value })),
  );

  private readonly router = inject(Router);
  private readonly leaveBypass = inject(LeaveBypassService);

  protected onLogout = (): void => {
    if (this.isOnGamePage()) this.leaveBypass.bypassOnce();
    const logOutUser = logoutUser();
    this.store.dispatch(logOutUser);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(GAME_ID);
    localStorage.removeItem(LANGUAGE_KEY);
    this.router.navigate(['/signin']);
  };

  protected onClick(item: SidebarItemType): void {
    this.router.navigate([item.route]);
  }

  protected playGame(): void {
    this.timer.setPendingBase(this.timer.baseSnapshot());
    this.gameService.newGame(START_FEN, this.chosenColor());
  }

  private isOnGamePage(): boolean {
    const tree = this.router.createUrlTree(['/game']);
    return this.router.isActive(tree, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
