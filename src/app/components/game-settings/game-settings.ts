import type { Signal } from '@angular/core';
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
import type { MoveRow } from '@/app/types/chess-piece.type';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import type { AppStateType } from '@/app/store/states/app.state';
import { GameService } from '@/app/services/game.service';
import { TranslatePipe } from '@ngx-translate/core';
import { GameViewerService } from '@/app/services/game-viewer.service';

@Component({
  selector: 'app-game-settings',
  imports: [TuiButton, TuiIcon, TuiScrollbar, TranslatePipe],
  templateUrl: './game-settings.html',
  styleUrl: './game-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettings {
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

  public readonly resignDisabled = computed(() => this.isFinished());

  protected readonly text = computed(() => {
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

  protected readonly store = inject<Store<AppStateType>>(Store);
  protected readonly gameService = inject(GameService);
  protected readonly undoDisabled = computed(() => !this.canUndo());
  protected readonly redoDisabled = computed(() => !this.canRedo());
  protected readonly viewer: GameViewerService = inject(GameViewerService);

  protected readonly atStart: Signal<boolean> = this.viewer.atStart;
  protected readonly atEnd: Signal<boolean> = this.viewer.atEnd;

  private readonly timer = inject(PlayerTimerService);
  private readonly canUndo = this.store.selectSignal(selectCanUndo);
  private readonly canRedo = this.store.selectSignal(selectCanRedo);
  private readonly isFinished = this.store.selectSignal(selectIsGameOver);

  private readonly moves = this.store.selectSignal(selectMoves);

  private readonly orientation = this.store.selectSignal(selectOrientation);

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

  public goStart = (): void => this.viewer.goStart();
  public goPrev = (): void => this.viewer.goPrev();
  public goNext = (): void => this.viewer.goNext();
  public goEnd = (): void => this.viewer.goEnd();
}
