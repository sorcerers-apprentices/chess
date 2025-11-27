import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { GameService } from '@/app/services/game.service';
import {
  selectChess,
  selectGameId,
  selectIsGameOver,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import { load, parseActiveColor } from '@/app/utilities/chess-piece';
import type { AppStateType } from '@/app/store/states/app.state';
import { Chess } from 'chess.js';

@Injectable({
  providedIn: 'root',
})
export class OpponentRunnerService {
  protected readonly store = inject<Store<AppStateType>>(Store);
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);

  // сигналы из стора
  private readonly pgn = this.store.selectSignal(selectChess);

  private readonly game = computed(() => {
    const pgn = this.pgn();
    return pgn ? load(pgn) : new Chess();
  });
  private readonly fen = computed(() => this.game().fen());

  private readonly gameId = this.store.selectSignal(selectGameId);
  private readonly orientation = this.store.selectSignal(selectOrientation); // 'white' | 'black'
  private readonly isGameOver = this.store.selectSignal(selectIsGameOver);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private readonly delayMs = 3000;

  private readonly autorun = effect((onCleanup) => {
    const id = this.gameId();
    const over = this.isGameOver?.() ?? false;

    if (!id || over) {
      this.clearPending();
      return;
    }

    // чей сейчас ход по FEN
    const active = parseActiveColor(this.fen());
    const me = this.orientation() === 'white' ? 'w' : 'b';
    const opponentTurn = active !== me;

    // если уже не очередь оппонента — отменяем отложенный ход
    if (!opponentTurn) {
      this.clearPending();
      return;
    }

    // уже запланирован ход — не ставим второй
    if (this.timeoutId !== null) return;

    // фиксируем id игры на момент планирования, чтобы игнорить
    // таймеры от старых партий
    const scheduledGameId = id;

    // задержка перед ходом оппонента
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null; // таймер отстрелил

      // ПОВТОРНАЯ ПРОВЕРКА ПЕРЕД ХОДОМ
      const sameGame = this.gameId() === scheduledGameId;
      const notOver = !(this.isGameOver?.() ?? false);

      const fenNow = this.fen();
      const activeNow = parseActiveColor(fenNow);
      const meNow = this.orientation() === 'white' ? 'w' : 'b';
      const opponentTurnNow = activeNow !== meNow;

      if (sameGame && notOver && opponentTurnNow) {
        //this.gameService.playOpponentMove();
        this.gameService.playEngineMove().then();
      }
    }, this.delayMs);

    onCleanup(this.clearPending);
  });

  // на уничтожение сервиса тоже чистим
  constructor() {
    this.destroyRef.onDestroy(this.clearPending);
  }

  private readonly clearPending = (): void => {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };
}
