import { Chess } from 'chess.js';
import { Store } from '@ngrx/store';
import { inject, Injectable, signal } from '@angular/core';
import { DEFAULT_POSITION } from '@/app/constants/chess-game.constants';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private store = inject(Store);
  private game = signal<Chess | null>(null);

  constructor() {
    this.newGame();
  }

  public newGame(): void {
    this.game.set(new Chess(DEFAULT_POSITION));
  }
}
