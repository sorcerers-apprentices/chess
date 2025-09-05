import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-page',
  imports: [Header],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {}
