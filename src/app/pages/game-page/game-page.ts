import { Header } from '../../components/header/header';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type Signal,
  signal,
} from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import { ChessBoard } from '@/app/components/chess-board/chess-board';
import { PlayerPanel } from '@/app/components/player-panel/player-panel';
import type { SquareType } from '@/app/types/chess-square.type';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';
import { GameSettings } from '@/app/components/game-settings/game-settings';
import { Store } from '@ngrx/store';
import type { GameStateType } from '@/app/store/states/game.state';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    ChessBoard,
    PlayerPanel,
    GameSettings,
  ],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {
  protected readonly store: Store<{ game: GameStateType }> = inject(
    Store<{ game: GameStateType }>,
  );
  protected orientation: Signal<'white' | 'black'> = toSignal(
    this.store.select((state) => state.game.orientation),
    {
      initialValue: 'white',
    },
  );
  protected boardOrientation = computed(() =>
    this.orientation() === 'white' ? 'whiteBottom' : 'whiteTop',
  );

  protected readonly topPlayerColor = computed(() =>
    this.orientation() === 'white' ? 'black' : 'white',
  );

  protected readonly bottomPlayerColor = computed(() =>
    this.orientation() === 'white' ? 'white' : 'black',
  );

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
  }
}
