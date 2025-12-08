import { Header } from '../../components/header/header';
import type {
  EffectRef,
  InputSignal,
  Signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
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
import type { PieceColorType, SquareType } from '@/app/types/chess-square.type';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';
import { GameSettings } from '@/app/components/game-settings/game-settings';
import { Store } from '@ngrx/store';
import { GameService } from '@/app/services/game.service';
import type { Chess, Color, Square } from 'chess.js';
import { GameSupabaseService } from '@/app/services/supabase/game-supabase.service';
import { loadGame } from '@/app/store/actions/game.actions';
import { OpponentRunnerService } from '@/app/services/opponent-runner.service';
import { load } from '@/app/utilities/chess-piece';
import {
  selectIsGameOver,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import type { AppStateType } from '@/app/store/states/app.state';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import type { TuiDialogContext } from '@taiga-ui/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiButton } from '@taiga-ui/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GameViewerService } from '@/app/services/game-viewer.service';
import { Router } from '@angular/router';
import {
  CHOSEN_COLOR_TOKEN,
  START_FEN,
} from '@/app/constants/chess-game.constants';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import type { ResultVariant } from '@/app/types/chess-piece.type';
import { StockfishService } from '@/app/services/stockfish/stockfish.service';
import { EnginePanel } from '@/app/components/engine-panel/engine-panel';
import type { MoveRecordType } from '@/app/store/states/game.state';

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
    TranslatePipe,
    TuiIcon,
    EnginePanel,
  ],
  templateUrl: './game-page.html',
  styleUrl: './game-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage {
  // 1. Template & inputs
  @ViewChild('gameOverTpl', { static: true })
  protected gameOverTpl?: TemplateRef<TuiDialogContext<void, undefined>>;

  public readonly id: InputSignal<string> = input.required<string>();
  protected readonly hint = signal<MoveRecordType | null>(null);
  protected readonly hintText = computed(() => {
    const hint = this.hint();
    if (!hint) {
      return null;
    }

    const uci = hint.uci;
    if (uci.length < 4) {
      return null;
    }

    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);

    return `${from} → ${to}`;
  });

  // 2. DI services
  private readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);
  private readonly gameSupabaseService: GameSupabaseService =
    inject(GameSupabaseService);
  private readonly gameService: GameService = inject(GameService);
  private readonly stockfishService = inject(StockfishService);
  private readonly opponent: OpponentRunnerService = inject(
    OpponentRunnerService,
  );
  private readonly viewer: GameViewerService = inject(GameViewerService);
  private readonly dialogs: TuiResponsiveDialogService = inject(
    TuiResponsiveDialogService,
  );
  private readonly leaveBypass: LeaveBypassService = inject(LeaveBypassService);
  private readonly router: Router = inject(Router);
  private readonly chosenColor: WritableSignal<PieceColorType> =
    inject(CHOSEN_COLOR_TOKEN);

  // 3. Store state & derived game state
  protected readonly pgn: Signal<string> = this.store.selectSignal(
    (state) => state.game.pgn,
  );
  protected readonly game: Signal<Chess> = computed(() => load(this.pgn()));
  protected readonly fen: Signal<string> = computed(() => this.game().fen());
  protected readonly orientation = this.store.selectSignal(
    (state) => state.game.orientation,
  );
  protected readonly isGameOver: Signal<boolean> =
    this.store.selectSignal(selectIsGameOver);

  // Flags: check/mate/king & players colors
  protected readonly isCheck: Signal<boolean> = computed(() =>
    this.gameService.isCheck(),
  );
  protected readonly isMate: Signal<boolean> = computed(() =>
    this.gameService.isMate(),
  );
  protected readonly kingSquare: Signal<Square | null> = computed(() =>
    this.gameService.kingSquare('turn'),
  );
  protected readonly topPlayerColor = computed(() =>
    this.orientation() === 'white' ? 'black' : 'white',
  );
  protected readonly bottomPlayerColor = computed(() =>
    this.orientation() === 'white' ? 'white' : 'black',
  );
  protected readonly meColor = this.store.selectSignal(selectOrientation);

  // Game result (for "Game Over" dialog)
  protected readonly resultVariant: Signal<ResultVariant> =
    computed<ResultVariant>(() => {
      const res = this.gameService.getGameResult();

      if (res.draw) return 'draw';

      const iAmWhite = this.meColor() === 'white';
      const mySide: 'white' | 'black' = iAmWhite ? 'white' : 'black';
      return res.winner === mySide ? 'win' : 'loss';
    });
  protected readonly resultText: Signal<string> = computed<string>(() => {
    const v = this.resultVariant();
    if (v === 'draw') return 'Game Drawn';
    if (v === 'win') return 'You won';
    return 'You lost';
  });

  // Local board / drag&drop state
  // куда можно поставить фигуру
  protected readonly allowedTargets = signal<ReadonlySet<Square> | null>(null);
  // локально можем хранить, откуда началось перетаскивание (если нужно для UI страницы)
  protected readonly dragFrom = signal<SquareType | null>(null);
  // последний совершённый ход (для логов/истории/нотации)
  protected readonly lastMove = signal<ChessMovePayloadType | null>(null);

  // Effects

  // загрузка партии по id
  private loadGameEffect: EffectRef = effect((): void =>
    this.store.dispatch(loadGame({ gameId: this.id() })),
  );
  private readonly showGameOverEffect: EffectRef = effect((): void => {
    const over: boolean = this.isGameOver();
    const hasTpl: boolean = this.gameOverTpl != null;

    if (over && hasTpl) {
      this.dialogs
        .open<void>(this.gameOverTpl, {
          size: 's',
          closeable: false,
          dismissible: false,
        })
        .subscribe();
    }
  });

  // Methods (обработчики, геттеры)
  public get engineStatus(): string {
    return this.stockfishService.status();
  }

  // Drag & drop API доски
  public onBoardDragStart(from: Square): void {
    // чей ход
    const turnPiece: Color = this.gameService.turn();
    const colorPieceSquare: Color | null = this.gameService.pieceColorAt(from);

    if (!colorPieceSquare || colorPieceSquare !== turnPiece) {
      this.dragFrom.set(null);
      this.allowedTargets.set(null);
      return;
    }

    const targets: ReadonlySet<Square> = this.gameService.getTargetsSet(from);

    this.dragFrom.set(from);
    this.allowedTargets.set(this.gameService.getTargetsSet(from));
    this.allowedTargets.set(targets);
  }

  public onBoardDragEnd(): void {
    this.dragFrom.set(null);
    this.allowedTargets.set(null);
  }

  public onBoardMove(move: ChessMovePayloadType): void {
    // запретить ходы
    if (this.viewer.isViewing()) {
      return;
    }

    const allowed: ReadonlySet<Square> | null = this.allowedTargets();
    // true только если есть сет разрешённых ходов, источник совпадает с текущим началом перетаскивания, и целевая клетка входит в этот сет
    const isAllowed: boolean =
      !!allowed && this.dragFrom() === move.from && allowed.has(move.to);

    if (!isAllowed) {
      this.dragFrom.set(null);
      this.allowedTargets.set(null);
      return;
    }

    const isMoveApplied: boolean = this.gameService.playMove(
      move.from,
      move.to,
    );

    if (isMoveApplied) this.lastMove.set(move);

    this.dragFrom.set(null);
    this.allowedTargets.set(null);
  }

  // Game control / navigation
  public newGame(): void {
    this.leaveBypass.bypassOnce();
    this.gameService.newGame(START_FEN, this.chosenColor());
  }

  public goHome(): void {
    this.leaveBypass.bypassOnce();
    this.router.navigate(['/home']).then();
  }

  public onEngineMoveClick(): void {
    this.stockfishService.setFen(this.fen());
    this.stockfishService.analyzeDepth(12);
  }

  public openEngineLog(): void {
    this.router.navigate(['/engine-log']).then();
  }

  protected async onHintClick(): Promise<void> {
    const res = await this.gameService.getHintForPlayer();
    this.hint.set(res);
  }
}
