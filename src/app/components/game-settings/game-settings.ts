import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TuiButton, TuiIcon, TuiScrollbar } from '@taiga-ui/core';
import { Store } from '@ngrx/store';
import {
  selectMoves,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import type { MoveRow } from '@/app/types/chess-piece.type';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import type { AppStateType } from '@/app/store/states/app.state';

@Component({
  selector: 'app-game-settings',
  imports: [TuiButton, TuiIcon, TuiScrollbar],
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
  private readonly timer = inject(PlayerTimerService);

  private readonly moves = this.store.selectSignal(selectMoves);

  private readonly orientation = this.store.selectSignal(selectOrientation);
}
