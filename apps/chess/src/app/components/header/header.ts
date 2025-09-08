import {
  inject,
  computed,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { TuiBadge, TuiFade } from '@taiga-ui/kit';
import { TUI_DARK_MODE, TuiButton } from '@taiga-ui/core';
import { TuiHeaderComponent, TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-header',
  imports: [
    TuiHeaderComponent,
    TuiButton,
    TuiNavigation,
    TuiBadge,
    Sidebar,
    TuiFade,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Header {
  protected open = false;
  protected readonly darkMode = inject(TUI_DARK_MODE);
  protected readonly icon = computed(() =>
    this.darkMode() ? '@tui.sun' : '@tui.moon',
  );
}
