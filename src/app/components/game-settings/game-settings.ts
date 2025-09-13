import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-settings',
  imports: [],
  templateUrl: './game-settings.html',
  styleUrl: './game-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettings {}
