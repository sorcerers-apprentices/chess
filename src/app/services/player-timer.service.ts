import type { EffectRef, Signal, WritableSignal } from '@angular/core';
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
import type { Chess } from 'chess.js';
import type { MoveRecordType } from '@/app/store/states/game.state';

type PersistShape = { elapsedMs: number; since: number | null };

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class PlayerTimerService {
  public readonly totalMs: Signal<number> = computed((): number => {
    const state: PersistShape = this.state();
    if (state.since === null) return state.elapsedMs;
    return state.elapsedMs + Math.max(0, this.now() - state.since);
  });

  protected readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly pgn: Signal<string> = this.store.selectSignal(selectChess);
  private readonly game: Signal<Chess> = computed(() => load(this.pgn()));
  private readonly fen: Signal<string> = computed(() => this.game().fen());

  private readonly moves: Signal<MoveRecordType[]> =
    this.store.selectSignal(selectMoves);
  private readonly orientation = this.store.selectSignal(selectOrientation);
  private readonly isGameOver: Signal<boolean> =
    this.store.selectSignal(selectIsGameOver);
  private readonly gameId: Signal<string> =
    this.store.selectSignal(selectGameId);

  private readonly state: WritableSignal<PersistShape> = signal<PersistShape>({
    elapsedMs: 0,
    since: null,
  });
  private readonly now: WritableSignal<number> = signal<number>(Date.now());

  private readonly me = computed<'w' | 'b'>(() =>
    this.orientation() === 'white' ? 'w' : 'b',
  );

  private readonly myMovesCount: Signal<number> = computed((): number => {
    const list: MoveRecordType[] = this.moves();
    const myColor = this.me();
    let count: number = 0;
    for (let i: number = 0; i < list.length; i++) {
      if (list[i].move.color === myColor) count++;
    }
    return count;
  });

  private readonly myTurn: Signal<boolean> = computed(
    (): boolean => parseActiveColor(this.fen()) === this.me(),
  );

  // считаем только когда мой ход, уже был ≥1 мой ход и партия не окончена
  private readonly shouldRun: Signal<boolean> = computed(
    (): boolean =>
      this.myTurn() && this.myMovesCount() > 0 && !this.isGameOver(),
  );

  constructor() {
    // тиканье только для UI (без мутации elapsedMs)
    const tickId = setInterval(() => this.now.set(Date.now()), 1000);

    // сброс при смене партии/цвета/начала игры
    const hydrateEffect: EffectRef = effect((): void => {
      const base: string = this.storageBase();
      const hasMoves: boolean = this.moves().length > 0;

      // новая игра: нет ходов — очищаем всё
      if (!hasMoves) {
        this.state.set({ elapsedMs: 0, since: null });
        this.clearStorage(base);
        return;
      }

      // читаем из localStorage
      const saved: PersistShape | null = this.readFromStorage(base);

      const nowMs: number = Date.now();
      const canRun: boolean = this.shouldRun();

      if (saved === null) {
        this.state.set({ elapsedMs: 0, since: canRun ? nowMs : null });
      } else {
        const carried: number =
          saved.since !== null
            ? saved.elapsedMs + Math.max(0, nowMs - saved.since)
            : saved.elapsedMs;
        this.state.set({ elapsedMs: carried, since: canRun ? nowMs : null });
      }

      this.writeToStorage(base, this.state());
    });

    // старт/стоп текущей «сессии»
    const runEffect: EffectRef = effect((): void => {
      const canRun: boolean = this.shouldRun();
      const current: PersistShape = this.state();
      const base: string = this.storageBase();

      if (canRun && current.since === null) {
        this.state.set({ elapsedMs: current.elapsedMs, since: Date.now() });
        this.writeToStorage(base, this.state());
      } else if (!canRun && current.since !== null) {
        const nowMs: number = Date.now();
        const added: number = Math.max(0, nowMs - current.since);
        this.state.set({ elapsedMs: current.elapsedMs + added, since: null });
        this.writeToStorage(base, this.state());
      }
    });

    // очистка при конце игры
    const finishEffect: EffectRef = effect((): void => {
      const over: boolean = this.isGameOver();
      if (!over) return;

      const base: string = this.storageBase();
      const current: PersistShape = this.state();

      if (current.since !== null) {
        const nowMs: number = Date.now();
        const added: number = Math.max(0, nowMs - current.since);
        this.state.set({ elapsedMs: current.elapsedMs + added, since: null });
      }
      this.clearStorage(base);
    });

    this.destroyRef.onDestroy((): void => {
      clearInterval(tickId);

      const base: string = this.storageBase();
      const current: PersistShape = this.state();
      if (current.since !== null) {
        const nowMs: number = Date.now();
        const added: number = Math.max(0, nowMs - current.since);
        this.state.set({ elapsedMs: current.elapsedMs + added, since: nowMs });
      }
      this.writeToStorage(base, this.state());

      hydrateEffect.destroy();
      runEffect.destroy();
      finishEffect.destroy();
    });
  }

  public reset(): void {
    this.clearStorage(this.storageBase());
    this.state.set({ elapsedMs: 0, since: null });
  }

  private storageBase(): string {
    const id: string = this.gameId();
    const color = this.orientation();
    return `chess:timer:${id}:${color}`;
  }

  private readFromStorage(base: string): PersistShape | null {
    const elapsedMsStorage: string | null = localStorage.getItem(`${base}:e`);
    const sinceStorage: string | null = localStorage.getItem(`${base}:s`);

    if (elapsedMsStorage === null && sinceStorage === null) return null;

    let elapsedMs: number = 0;
    let since: number | null = null;

    if (elapsedMsStorage !== null) {
      const n: number = Number(elapsedMsStorage);
      if (!Number.isNaN(n) && n >= 0) elapsedMs = n;
    }

    if (sinceStorage !== null) {
      const n: number = Number(sinceStorage);
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
