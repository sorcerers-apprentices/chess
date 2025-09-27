import { Header } from '../../components/header/header';
import type { TemplateRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
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
import { GameService } from '@/app/services/game.service';
import type { Square } from 'chess.js';
import { GameSupabaseService } from '@/app/services/game-supabase.service';
import { loadGame } from '@/app/store/actions/game.actions';
import { OpponentRunnerService } from '@/app/services/opponent-runner.service';
import { load } from '@/app/utilities/chess-piece';
import { selectIsGameOver } from '@/app/store/selectors/game.selectors';
import type { AppStateType } from '@/app/store/states/app.state';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import type { TuiDialogContext } from '@taiga-ui/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    ChessBoard,
    PlayerPanel,
    GameSettings,
    TuiButton,
  ],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {
  @ViewChild('gameOverTpl', { static: true })
  protected gameOverTpl?: TemplateRef<TuiDialogContext<void, undefined>>;

  public readonly id = input.required<string>();
  protected readonly store = inject<Store<AppStateType>>(Store);
  protected readonly gameSupabaseService = inject(GameSupabaseService);
  protected readonly gameService = inject(GameService);
  protected readonly opponent = inject(OpponentRunnerService);

  protected loadGameEffect = effect(() =>
    this.store.dispatch(loadGame({ gameId: this.id() })),
  );

  protected readonly pgn = this.store.selectSignal((state) => state.game.pgn);
  protected readonly game = computed(() => load(this.pgn()));
  protected readonly fen = computed(() => this.game().fen());
  protected readonly orientation = this.store.selectSignal(
    (state) => state.game.orientation,
  );
  protected readonly isGameOver = this.store.selectSignal(selectIsGameOver);
  protected readonly dialogs = inject(TuiResponsiveDialogService);

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
  protected readonly allowedTargets = signal<ReadonlySet<Square> | null>(null);

  // локально можем хранить, откуда началось перетаскивание (если нужно для UI страницы)
  protected readonly dragFrom = signal<SquareType | null>(null);

  // последний совершённый ход (для логов/истории/нотации)
  protected readonly lastMove = signal<ChessMovePayloadType | null>(null);

  private readonly showGameOverEffect = effect(() => {
    const over = this.isGameOver();
    const hasTpl = this.gameOverTpl != null;

    if (over && hasTpl) {
      this.dialogs
        .open<void>(this.gameOverTpl, {
          size: 's',
          closeable: false, // если нужно убрать крестик/ESC/клик по фону
        })
        .subscribe();
    }
  });

  public onBoardDragStart(from: Square): void {
    // чей ход
    const turnPiece = this.gameService.turn();
    const colorPieceSquare = this.gameService.pieceColorAt(from);

    if (!colorPieceSquare || colorPieceSquare !== turnPiece) {
      this.dragFrom.set(null);
      this.allowedTargets.set(null);
      return;
    }

    const targets = this.gameService.getTargetsSet(from);

    this.dragFrom.set(from);
    this.allowedTargets.set(this.gameService.getTargetsSet(from));
    this.allowedTargets.set(targets);
  }

  public onBoardDragEnd(): void {}

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

    const isMoveApplied = this.gameService.playMove(move.from, move.to);

    if (isMoveApplied) this.lastMove.set(move);

    this.dragFrom.set(null);
    this.allowedTargets.set(null);
    // здесь позже дергать движок/сервис, таймеры, историю и т.д.
  }
}
