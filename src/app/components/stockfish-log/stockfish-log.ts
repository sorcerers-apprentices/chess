import type { Signal } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { StockfishService } from '@/app/services/stockfish/stockfish.service';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { selectGameId } from '@/app/store/selectors/game.selectors';
import { TuiButton } from '@taiga-ui/core';

type EngineLogEntryType = 'command' | 'response' | 'other';

type EngineLogEntry = {
  type: EngineLogEntryType;
  text: string;
};

@Component({
  selector: 'app-stockfish-log',
  imports: [TuiButton],
  templateUrl: './stockfish-log.html',
  styleUrl: './stockfish-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockfishLog {
  private readonly stockfishService: StockfishService =
    inject(StockfishService);
  private readonly routerService: Router = inject(Router);
  private readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);

  protected readonly log: Signal<string[]> = this.stockfishService.log;

  protected readonly gameId = this.store.selectSignal(selectGameId);

  protected readonly hasLines: Signal<boolean> = computed(
    (): boolean => this.log().length > 0,
  );

  protected readonly logEntries = computed<EngineLogEntry[]>(() =>
    this.log().map((line) => {
      if (line.startsWith('>>>')) {
        return { type: 'command', text: line };
      }

      if (line.startsWith('<<<')) {
        return { type: 'response', text: line };
      }

      return { type: 'other', text: line };
    }),
  );

  protected onBackClick(): void {
    const id = this.gameId();

    if (id == null) {
      this.routerService.navigate(['home']).then();
      return;
    }
    this.routerService.navigate(['game', id]).then();
  }

  protected onClearClick(): void {
    // чистить лог, если нужно
    this.stockfishService.log.set([]);
  }
}
