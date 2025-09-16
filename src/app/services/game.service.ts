import { Chess } from 'chess.js';
import { Store } from '@ngrx/store';
import type { Square } from 'chess.js';
import { newGame } from '@/app/store/actions/game.actions';
import { computed, inject, Injectable } from '@angular/core';
import { selectChessFen } from '@/app/store/selectors/game.selectors';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject(Store);
  private readonly fen = this.store.selectSignal(selectChessFen);
  private readonly game = computed(() => new Chess(this.fen()));

  public newGame(fen?: string): void {
    this.store.dispatch(newGame({ initialFen: fen }));
  }

  public getAvailableMoves(square: Square): string[] {
    return this.game().moves({ square }) ?? [];
  }

  public getAllAvailableMoves(): string[] {
    return this.game().moves() ?? [];
  }
}
