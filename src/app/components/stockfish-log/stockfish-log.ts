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

@Component({
  selector: 'app-stockfish-log',
  imports: [],
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

  protected onBackClick(): void {
    this.routerService.navigate(['game', this.gameId]).then();
  }

  protected onClearClick(): void {
    // чистить лог, если нужно
    this.stockfishService.log.set([]);
  }
}
