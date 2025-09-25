import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectChess,
  selectIsGameOver,
  selectMoves,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import type { Color } from 'chess.js';
import { load, parseActiveColor } from '@/app/utilities/chess-piece';
import { GameService } from '@/app/services/game.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerTimerService {
  public readonly totalMs = computed(() => this.elapsedMs());

  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameService = inject(GameService);

  // сигналы из стора
  private readonly pgn = this.store.selectSignal(selectChess);
  private readonly game = computed(() => load(this.pgn()));
  private readonly fen = computed(() => this.game().fen());
  private readonly moves = this.store.selectSignal(selectMoves);
  private readonly orientation = this.store.selectSignal(selectOrientation);
  private readonly isGameOver = this.store.selectSignal(selectIsGameOver);

  private readonly me = computed<Color>(() =>
    this.orientation() === 'white' ? 'w' : 'b',
  );
  private readonly myMovesCount = computed(() => {
    const moves = this.moves();
    const myColor = this.me();
    return moves.reduce(
      (count, move) => (move.move.color === myColor ? count + 1 : count),
      0,
    );
  });
  private readonly myTurn = computed(
    () => parseActiveColor(this.fen()) === this.me(),
  );

  // накопленное время и точка старта «протекания»
  private readonly elapsedMs = signal<number>(0);
  private readonly since = signal<number | null>(null);

  // правило задания: считаем время ТОЛЬКО когда мой ход И я уже делал >= 1 ход И не конец партии
  private readonly running = computed(
    () => this.myTurn() && this.myMovesCount() > 0 && !this.isGameOver(),
  );

  constructor() {
    // Один эффект для всего управления таймером
    const timerEffect = effect(() => {
      const moves = this.moves();
      const running = this.running();
      const since = this.since();

      // Сброс при новой игре
      if (moves.length === 0) {
        this.elapsedMs.set(0);
        this.since.set(null);
        return;
      }

      // Управление запуском/остановкой
      if (!running && since !== null) {
        this.elapsedMs.update((elapsed) => elapsed + (Date.now() - since));
        this.since.set(null);
      } else if (running && since === null) {
        this.since.set(Date.now());
      }
    });

    // Интервал только для обновления времени (без логики условий)
    const intervalId = setInterval(() => {
      const since = this.since();
      if (since !== null) {
        const now = Date.now();
        this.elapsedMs.update((elapsed) => elapsed + (now - since));
        this.since.set(now);
      }
    }, 1000);

    this.destroyRef.onDestroy(() => {
      clearInterval(intervalId);
      timerEffect.destroy();
    });
  }
}
