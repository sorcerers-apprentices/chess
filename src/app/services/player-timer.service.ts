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
  selectGameId,
  selectIsGameOver,
  selectMoves,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import { load, parseActiveColor } from '@/app/utilities/chess-piece';
import type { AppStateType } from '@/app/store/states/app.state';

type PersistShape = { elapsedMs: number; since: number | null };

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class PlayerTimerService {
  public readonly totalMs = computed(() => {
    const s = this.state();
    if (s.since === null) return s.elapsedMs;
    return s.elapsedMs + Math.max(0, this.now() - s.since);
  });

  protected readonly store = inject<Store<AppStateType>>(Store);

  private readonly destroyRef = inject(DestroyRef);

  private readonly pgn = this.store.selectSignal(selectChess);
  private readonly game = computed(() => load(this.pgn()));
  private readonly fen = computed(() => this.game().fen());

  private readonly moves = this.store.selectSignal(selectMoves);
  private readonly orientation = this.store.selectSignal(selectOrientation);
  private readonly isGameOver = this.store.selectSignal(selectIsGameOver);
  private readonly gameId = this.store.selectSignal(selectGameId);

  private readonly state = signal<PersistShape>({ elapsedMs: 0, since: null });
  private readonly now = signal<number>(Date.now());

  private readonly me = computed<'w' | 'b'>(() =>
    this.orientation() === 'white' ? 'w' : 'b',
  );

  private readonly myMovesCount = computed(() => {
    const list = this.moves();
    const myColor = this.me();
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].move.color === myColor) count++;
    }
    return count;
  });

  private readonly myTurn = computed(
    () => parseActiveColor(this.fen()) === this.me(),
  );

  // считаем только когда мой ход, уже был ≥1 мой ход и партия не окончена
  private readonly shouldRun = computed(
    () => this.myTurn() && this.myMovesCount() > 0 && !this.isGameOver(),
  );

  constructor() {
    // тиканье только для UI (без мутации elapsedMs)
    const tickId = setInterval(() => this.now.set(Date.now()), 1000);

    // сброс при смене партии/цвета/начала игры
    const hydrateEffect = effect(() => {
      const base = this.storageBase();
      const hasMoves = this.moves().length > 0;

      // новая игра: нет ходов — очищаем всё
      if (!hasMoves) {
        this.state.set({ elapsedMs: 0, since: null });
        this.clearStorage(base);
        return;
      }

      // читаем из localStorage
      const saved = this.readFromStorage(base);

      const nowMs = Date.now();
      const canRun = this.shouldRun();

      if (saved === null) {
        this.state.set({ elapsedMs: 0, since: canRun ? nowMs : null });
      } else {
        const carried =
          saved.since !== null
            ? saved.elapsedMs + Math.max(0, nowMs - saved.since)
            : saved.elapsedMs;
        this.state.set({ elapsedMs: carried, since: canRun ? nowMs : null });
      }

      this.writeToStorage(base, this.state());
    });

    // старт/стоп текущей «сессии»
    const runEffect = effect(() => {
      const canRun = this.shouldRun();
      const cur = this.state();
      const base = this.storageBase();

      if (canRun && cur.since === null) {
        this.state.set({ elapsedMs: cur.elapsedMs, since: Date.now() });
        this.writeToStorage(base, this.state());
      } else if (!canRun && cur.since !== null) {
        const nowMs = Date.now();
        const added = Math.max(0, nowMs - cur.since);
        this.state.set({ elapsedMs: cur.elapsedMs + added, since: null });
        this.writeToStorage(base, this.state());
      }
    });

    // очистка при конце игры
    const finishEffect = effect(() => {
      const over = this.isGameOver();
      if (!over) return;

      const base = this.storageBase();
      const cur = this.state();

      if (cur.since !== null) {
        const nowMs = Date.now();
        const added = Math.max(0, nowMs - cur.since);
        this.state.set({ elapsedMs: cur.elapsedMs + added, since: null });
      }
      this.clearStorage(base);
    });

    this.destroyRef.onDestroy(() => {
      clearInterval(tickId);

      const base = this.storageBase();
      const cur = this.state();
      if (cur.since !== null) {
        const nowMs = Date.now();
        const added = Math.max(0, nowMs - cur.since);
        this.state.set({ elapsedMs: cur.elapsedMs + added, since: nowMs });
      }
      this.writeToStorage(base, this.state());

      hydrateEffect.destroy();
      runEffect.destroy();
      finishEffect.destroy();
    });
  }

  private storageBase(): string {
    const id = this.gameId();
    const color = this.orientation();
    return `chess:timer:${id}:${color}`;
  }

  private readFromStorage(base: string): PersistShape | null {
    const elapsedMsStorage = localStorage.getItem(`${base}:e`);
    const sinceStorage = localStorage.getItem(`${base}:s`);

    if (elapsedMsStorage === null && sinceStorage === null) return null;

    let elapsedMs = 0;
    let since: number | null = null;

    if (elapsedMsStorage !== null) {
      const n = Number(elapsedMsStorage);
      if (!Number.isNaN(n) && n >= 0) elapsedMs = n;
    }

    if (sinceStorage !== null) {
      const n = Number(sinceStorage);
      if (!Number.isNaN(n) && n > 0) since = n;
    }

    return { elapsedMs, since };
  }

  private writeToStorage(base: string, value: PersistShape): void {
    try {
      localStorage.setItem(`${base}:e`, String(value.elapsedMs));
      if (value.since === null) {
        localStorage.removeItem(`${base}:s`);
      } else {
        localStorage.setItem(`${base}:s`, String(value.since));
      }
    } catch {}
  }

  private clearStorage(base: string): void {
    try {
      localStorage.removeItem(`${base}:e`);
      localStorage.removeItem(`${base}:s`);
    } catch {}
  }
}
