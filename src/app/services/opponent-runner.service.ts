import { computed, effect, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameService } from '@/app/services/game.service';
import {
  selectChess,
  selectGameId,
  selectIsGameOver,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import { load, parseActiveColor } from '@/app/utilities/chess-piece';

@Injectable({
  providedIn: 'root',
})
export class OpponentRunnerService {
  private readonly store = inject(Store);
  private readonly gameService = inject(GameService);

  // сигналы из стора
  private readonly pgn = this.store.selectSignal(selectChess);
  private readonly game = computed(() => load(this.pgn()));
  private readonly fen = computed(() => this.game().fen());
  private readonly gameId = this.store.selectSignal(selectGameId);
  private readonly orientation = this.store.selectSignal(selectOrientation); // 'white' | 'black'
  private readonly isGameOver = this.store.selectSignal(selectIsGameOver);

  // локальный флаг занятости (чтобы не стреляло повторно)
  private busy = false;
  private readonly delayMs = 1000;

  private readonly autorun = effect(() => {
    const id = this.gameId();
    if (!id || this.busy) return;

    const fen = this.fen();
    const over = this.isGameOver?.() ?? false;
    if (over) return;

    // чей сейчас ход по FEN
    const active = parseActiveColor(fen);
    const me = this.orientation() === 'white' ? 'w' : 'b';
    const opponentTurn = active !== me;
    if (!opponentTurn) return;

    this.busy = true;
    // задержка перед ходом оппонента
    setTimeout(() => {
      try {
        // локальный бот на chess.js — сам диспатчит playMove и завершает партию при необходимости
        this.gameService.playOpponentMove();
      } finally {
        this.busy = false;
      }
    }, this.delayMs);
  });
}
