import type { EffectRef, Signal, WritableSignal } from '@angular/core';
import { untracked } from '@angular/core';
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
import type { PersistShape } from '@/app/types/chess-piece.type';
import { TimerStorageService } from '@/app/services/timer-storage.service';

@Injectable({
  providedIn: 'root',
})
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
  private readonly baseKey: Signal<string> = computed(
    (): string => `chess:timer:${this.gameId()}:${this.orientation()}`,
  );
  private readonly storageTimer: TimerStorageService =
    inject(TimerStorageService);
  private readonly skipPersistOnce = signal(false);

  private readonly state: WritableSignal<PersistShape> = signal<PersistShape>({
    elapsedMs: 0,
    since: null,
  });
  private readonly now: WritableSignal<number> = signal<number>(Date.now());

  private readonly me = computed<'w' | 'b'>(() =>
    this.orientation() === 'white' ? 'w' : 'b',
  );

  private readonly suppressBase = signal<string | null>(null);

  // когда baseKey меняется (другая партия/ориентация) — снимаем блок
  private readonly releaseSuppressOnBaseChange = effect(() => {
    const base = this.baseKey();
    const gameId = this.gameId();
    if (
      this.suppressBase() !== null &&
      this.suppressBase() !== base &&
      gameId
    ) {
      this.suppressBase.set(null);
      console.log('[TIMER] suppress cleared: base changed to', base);
    }
  });

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
      const base: string = this.baseKey();
      const hasMoves: boolean = this.moves().length > 0;

      // новая игра: нет ходов — очищаем всё
      if (!hasMoves) {
        const next: PersistShape = { elapsedMs: 0, since: null };
        this.state.set(next);
        this.clearStorage(base);
        return;
      }

      // читаем из localStorage
      const saved: PersistShape | null = this.readFromStorage(base);

      const nowMs: number = Date.now();
      const canRun: boolean = this.shouldRun();

      let next: PersistShape;
      if (saved === null) {
        next = { elapsedMs: 0, since: canRun ? nowMs : null };
      } else {
        const carried =
          saved.since !== null
            ? saved.elapsedMs + Math.max(0, nowMs - saved.since)
            : saved.elapsedMs;
        next = { elapsedMs: carried, since: canRun ? nowMs : null };
      }

      this.state.set(next);

      // запись только если есть отличие
      this.writeToStorage(base, next);
    });

    // старт/стоп текущей «сессии»
    const runEffect: EffectRef = effect((): void => {
      const canRun: boolean = this.shouldRun();
      const current: PersistShape = this.state();
      const base: string = this.baseKey();

      if (canRun && current.since === null) {
        const next = { elapsedMs: current.elapsedMs, since: Date.now() };
        this.state.set(next);
        this.writeToStorage(base, next);
      } else if (!canRun && current.since !== null) {
        const nowMs = Date.now();
        const added = Math.max(0, nowMs - current.since);
        const next = { elapsedMs: current.elapsedMs + added, since: null };
        this.state.set(next);
        this.writeToStorage(base, next);
      }
    });

    // очистка при конце игры
    const finishEffect: EffectRef = effect((): void => {
      const over: boolean = this.isGameOver();
      if (!over) return;

      const base: string = this.baseKey();
      const current: PersistShape = this.state();

      if (current.since !== null) {
        const nowMs: number = Date.now();
        const added: number = Math.max(0, nowMs - current.since);
        const next = { elapsedMs: current.elapsedMs + added, since: null };
        this.state.set(next);
        this.writeToStorage(base, next);
      } else {
        this.clearStorage(base);
      }
    });

    this.destroyRef.onDestroy((): void => {
      clearInterval(tickId);

      const base: string = this.baseKey();
      const current: PersistShape = this.state();

      // если reset уже прошёл — ничего не пишем в storage
      if (this.skipPersistOnce()) {
        console.log('[TIMER] onDestroy(): skip persist (after reset)');
        this.skipPersistOnce.set(false);
        return;
      }

      if (current.since !== null) {
        const nowMs: number = Date.now();
        const added: number = Math.max(0, nowMs - current.since);
        this.state.set({ elapsedMs: current.elapsedMs + added, since: null });
      }
      console.log('[TIMER] onDestroy(): persist', base, this.state());
      this.writeToStorage(base, this.state());

      hydrateEffect.destroy();
      runEffect.destroy();
      finishEffect.destroy();
    });
  }

  public reset(): void {
    const base = this.baseKey();
    this.clearStorage(base);
    this.state.set({ elapsedMs: 0, since: null });
    this.skipPersistOnce.set(true);
    this.suppressBase.set(base);
  }

  private readFromStorage(base: string): PersistShape | null {
    return this.storageTimer.read(base);
  }

  private writeToStorage(base: string, next: PersistShape): void {
    if (this.suppressBase() === base) {
      console.log('[TIMER] write blocked for base', base);
      return;
    }
    untracked(() => {
      const previous: PersistShape | null = this.storageTimer.read(base);
      if (previous && this.samePersist(previous, next)) return;
      this.storageTimer.write(base, next);
    });
  }

  private samePersist(prev: PersistShape, next: PersistShape): boolean {
    return prev.elapsedMs === next.elapsedMs && prev.since === next.since;
  }

  private clearStorage(base: string): void {
    untracked(() => this.storageTimer.clear(base));
  }
}
