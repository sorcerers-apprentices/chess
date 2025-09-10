import {
  signal,
  inject,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  TuiOption,
  TuiOptGroup,
  TUI_DARK_MODE,
  TuiDataListComponent,
} from '@taiga-ui/core';
import { Router } from '@angular/router';
import { TuiSwitch } from '@taiga-ui/kit';
import { RoutePath } from '../../app.routes';
import { TranslatePipe } from '@ngx-translate/core';
import type { RoutePathValue } from '../../app.routes';
import { LanguageService } from '@/app/services/language.service';

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
    TuiOption,
    TuiSwitch,
    TranslatePipe,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly translate = inject(LanguageService);

  protected readonly sidebarMenu = signal<SidebarMapType>({
    'sidebar.game': [
      { nameKey: 'sidebar.newGame', route: RoutePath.main },
      { nameKey: 'sidebar.resume', route: RoutePath.main },
      { nameKey: 'sidebar.playVsEngine', route: RoutePath.main },
    ],
    'sidebar.analysis': [
      { nameKey: 'sidebar.analysisBoard', route: RoutePath.main },
    ],
    'sidebar.settings': [{ nameKey: 'sidebar.profile', route: RoutePath.main }],
  });

  protected readonly sidebarGroups = computed(() =>
    Object.entries(this.sidebarMenu()).map(([key, value]) => ({ key, value })),
  );

  private readonly router = inject(Router);

  protected toggleTheme(): void {
    this.darkMode.set(!this.darkMode());
  }

  protected toggleLanguage(): void {
    this.translate.toggleLanguage();
  }

  protected onClick(item: SidebarItemType): void {
    this.router.navigate([item.route]);
  }
}
