import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiButton, TuiIcon, TuiScrollbar } from '@taiga-ui/core';

@Component({
  selector: 'app-game-settings',
  imports: [TuiButton, TuiIcon, TuiScrollbar],
  templateUrl: './game-settings.html',
  styleUrl: './game-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettings {}
