import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { ChessBoard } from '@/app/components/chess-board/chess-board';
import { GameSettings } from '@/app/components/game-settings/game-settings';
import { PlayerPanel } from '@/app/components/player-panel/player-panel';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';
import type { SquareType } from '@/app/types/chess-square.type';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';

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

  // последний совершённый ход (для логов/истории/нотации)
  protected readonly lastMove = signal<ChessMovePayloadType | null>(null);

  // локально можем хранить, откуда началось перетаскивание (если нужно для UI страницы)
  private readonly dragFrom = signal<SquareType | null>(null);

  public onBoardDragStart(from: SquareType): void {
    this.dragFrom.set(from);
    // здесь когда будет движок посчитать allowedTargets и пробросить в Board
  }

  public onBoardDragEnd(): void {
    this.dragFrom.set(null);
    // здесь позже очистить allowedTargets
  }

  public onBoardMove(event: ChessMovePayloadType): void {
    this.lastMove.set(event);
    // здесь позже дергать движок/сервис, таймеры, историю и т.д.
    // сейчас просто логировать:
    console.log('[GamePage] move', event);
  }
}
