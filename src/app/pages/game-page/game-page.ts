import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { ChessBoard } from '@/app/components/chess-board/chess-board';
import { GameSettings } from '@/app/components/game-settings/game-settings';
import { PlayerPanel } from '@/app/components/player-panel/player-panel';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    ChessBoard,
    GameSettings,
    PlayerPanel,
  ],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {
  protected readonly orientation: BoardOrientationType = 'whiteBottom';

  protected readonly topPlayerColor: 'white' | 'black' =
    this.orientation === 'whiteBottom' ? 'black' : 'white';

  protected readonly bottomPlayerColor: 'white' | 'black' =
    this.orientation === 'whiteBottom' ? 'white' : 'black';
}
