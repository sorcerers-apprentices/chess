import type { InputSignal, Signal, WritableSignal } from '@angular/core';
import { input } from '@angular/core';
import { signal } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TuiButton, TuiIcon, TuiScrollbar } from '@taiga-ui/core';
import { Store } from '@ngrx/store';
import {
  selectCanRedo,
  selectCanUndo,
  selectIsGameOver,
  selectMoves,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import type { MoveRow } from '@/app/types/chess-type/chess-piece.type';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import type { AppStateType } from '@/app/store/states/app.state';
import { GameService } from '@/app/services/game.service';
import { TranslatePipe } from '@ngx-translate/core';
import { GameViewerService } from '@/app/services/game-viewer.service';
import type { EngineMove } from '@/app/types/stockfish.type';
import { EnginePanel } from '@/app/components/engine-panel/engine-panel';
import { TuiTabs } from '@taiga-ui/kit';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-settings',
  imports: [
    TuiButton,
    TuiIcon,
    TuiScrollbar,
    TuiTabs,
    TranslatePipe,
    EnginePanel,
  ],
  templateUrl: './game-settings.html',
  styleUrl: './game-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettings {
  private readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);
  private readonly gameService: GameService = inject(GameService);
  private readonly viewer: GameViewerService = inject(GameViewerService);
  private readonly timer: PlayerTimerService = inject(PlayerTimerService);
  private readonly router: Router = inject(Router);

  private readonly canUndo: Signal<boolean> =
    this.store.selectSignal(selectCanUndo);
  private readonly canRedo: Signal<boolean> =
    this.store.selectSignal(selectCanRedo);
  private readonly isFinished: Signal<boolean> =
    this.store.selectSignal(selectIsGameOver);

  private readonly moves = this.store.selectSignal(selectMoves);
  private readonly orientation = this.store.selectSignal(selectOrientation);

  public readonly movesRows = computed<MoveRow[]>(() => {
    const list = this.moves(); // массив из стора
    const myColor = this.orientation() === 'white' ? 'w' : 'b';

    return list.map((moveRecord, index) => {
      const isMine = moveRecord.move.color === myColor;
      const from = moveRecord.move.from;
      const to = moveRecord.move.to;

      return {
        num: index + 1,
        player: isMine ? { from, to } : undefined,
        opponent: !isMine ? { from, to } : undefined,
        playerText: isMine ? `${from} → ${to}` : '-',
        opponentText: !isMine ? `${from} → ${to}` : '-',
      };
    });
  });

  public readonly resignDisabled: Signal<boolean> = computed((): boolean =>
    this.isFinished(),
  );

  public readonly fen: InputSignal<string> = input.required<string>();
  public readonly lastEngineMoveSignal: InputSignal<
    EngineMove | null | undefined
  > = input<EngineMove | null>();

  protected readonly text: Signal<string> = computed((): string => {
    const totalSec = Math.floor(this.timer.totalMs() / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    // сразу форматируем с ведущими нулями
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    return `${hh} : ${mm} : ${ss}`;
  });

  protected readonly undoDisabled: Signal<boolean> = computed(
    (): boolean => !this.canUndo(),
  );
  protected readonly redoDisabled: Signal<boolean> = computed(
    (): boolean => !this.canRedo(),
  );

  protected readonly atStart: Signal<boolean> = this.viewer.atStart;
  protected readonly atEnd: Signal<boolean> = this.viewer.atEnd;
  // 0 — Ходы, 1 — Движок
  protected readonly activeTab: WritableSignal<number> = signal(0);

  public onUndoClick(): void {
    if (this.canUndo()) this.gameService.undoMove();
  }

  public onRedoClick(): void {
    if (this.canRedo()) this.gameService.redoMove();
  }

  public onResignClick(): void {
    if (this.resignDisabled()) return;
    this.gameService.resign();
  }

  public openEngineLog(): void {
    this.router.navigate(['/engine-log']).then();
  }

  public goStart = (): void => this.viewer.goStart();
  public goPrev = (): void => this.viewer.goPrev();
  public goNext = (): void => this.viewer.goNext();
  public goEnd = (): void => this.viewer.goEnd();
}
