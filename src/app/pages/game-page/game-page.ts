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
import { GameService } from '@/app/services/game.service';
import type { Square } from 'chess.js';

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

  protected readonly game = inject(GameService);

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

  // куда можно поставить фигуру
  protected readonly allowedTargets = signal<ReadonlySet<SquareType> | null>(
    null,
  );

  // локально можем хранить, откуда началось перетаскивание (если нужно для UI страницы)
  protected readonly dragFrom = signal<SquareType | null>(null);

  // последний совершённый ход (для логов/истории/нотации)
  protected readonly lastMove = signal<ChessMovePayloadType | null>(null);

  public onBoardDragStart(from: Square): void {
    // чей ход
    const turnPiece = this.game.turn();
    const colorPieceSquare = this.game.pieceColorAt(from);

    if (!colorPieceSquare || colorPieceSquare !== turnPiece) {
      this.dragFrom.set(null);
      this.allowedTargets.set(null);
    }

    this.dragFrom.set(from);
    this.allowedTargets.set(this.game.getTargetsSet(from));
  }

  public onBoardDragEnd(): void {
    //this.dragFrom.set(null);
    //this.allowedTargets.set(null);
  }

  public onBoardMove(move: ChessMovePayloadType): void {
    const allowed = this.allowedTargets();
    // true только если есть сет разрешённых ходов, источник совпадает с текущим началом перетаскивания, и целевая клетка входит в этот сет
    const isAllowed =
      !!allowed && this.dragFrom() === move.from && allowed.has(move.to);

    if (!isAllowed) {
      this.dragFrom.set(null);
      this.allowedTargets.set(null);
      return;
    }

    const isMoveApplied = this.game.playMove(move.from, move.to);

    if (isMoveApplied) this.lastMove.set(move);

    this.dragFrom.set(null);
    this.allowedTargets.set(null);
    // здесь позже дергать движок/сервис, таймеры, историю и т.д.
  }
}
