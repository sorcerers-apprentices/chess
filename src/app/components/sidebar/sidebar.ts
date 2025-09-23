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
  LANGUAGE_TOKEN,
  LanguageService,
} from '@/app/services/language.service';
import { LOCAL_STORAGE_KEY } from '@/app/constants/auth.constants';
import { FormsModule } from '@angular/forms';
import { logoutUser } from '@/app/store/actions/user.actions';
import { Store } from '@ngrx/store';

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
  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly translate = inject(LanguageService);
  protected readonly store = inject(Store);
  protected token = localStorage.getItem(LOCAL_STORAGE_KEY);

  protected langEn = linkedSignal(() => this.language() === 'en');
  protected langEffect = effect(() =>
    this.language.set(this.langEn() ? 'en' : 'ru'),
  );

  protected readonly sidebarMenu = signal<SidebarMapType>({
    'sidebar.game': [
      { nameKey: 'sidebar.newGame', route: RoutePath.home },
      { nameKey: 'sidebar.playVsEngine', route: RoutePath.game },
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

  protected onLogout = (): void => {
    const logOutUser = logoutUser();
    this.store.dispatch(logOutUser);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.router.navigate(['/signin']);
  };

  protected onClick(item: SidebarItemType): void {
    this.router.navigate([item.route]);
  }
}
