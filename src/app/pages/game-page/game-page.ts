import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { ChessBoard } from '@/app/components/chess-board/chess-board';
import { GameSettings } from '@/app/components/game-settings/game-settings';

@Component({
  selector: 'app-game-page',
  imports: [Header, TuiNavigation, Navigation, ChessBoard, GameSettings],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {}
