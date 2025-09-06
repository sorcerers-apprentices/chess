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
import { TuiSwitch } from '@taiga-ui/kit';
import { RoutePath } from '../../app.routes';
import type { RoutePathValue } from '../../app.routes';
import { Router } from '@angular/router';

type SidebarItemType = {
  name: string;
  route: RoutePathValue;
};

type SidebarMapType = Record<string, SidebarItemType[]>;

@Component({
  selector: 'app-sidebar',
  imports: [TuiDataListComponent, TuiOptGroup, TuiOption, TuiSwitch],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly darkMode = inject(TUI_DARK_MODE);

  protected readonly sidebarMenu = signal<SidebarMapType>({
    Game: [
      { name: 'New game', route: RoutePath.login },
      { name: 'Resume', route: RoutePath.main },
      { name: 'Play vs Engine', route: RoutePath.main },
    ],
    Analysis: [{ name: 'Analysis board', route: RoutePath.main }],
    Settings: [{ name: 'Profile', route: RoutePath.main }],
  });

  protected readonly sidebarGroups = computed(() =>
    Object.entries(this.sidebarMenu()).map(([key, value]) => ({ key, value })),
  );

  private readonly router = inject(Router);

  protected toggleTheme(): void {
    this.darkMode.set(!this.darkMode());
  }

  protected onClick(item: SidebarItemType): void {
    this.router.navigate([item.route]);
  }
}
