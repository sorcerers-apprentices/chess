import { Store } from '@ngrx/store';
import { DEFAULT_POSITION } from 'chess.js';
import { inject, Injectable } from '@angular/core';
import { newGame } from '@/app/store/actions/game.actions';
import { selectChessGame } from '@/app/store/selectors/game.selectors';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject(Store);
  private readonly game = this.store.selectSignal(selectChessGame);

  public newGame(fen?: string): void {
    const position = fen ?? DEFAULT_POSITION;
    this.store.dispatch(newGame({ initialFen: position }));
  }
}
