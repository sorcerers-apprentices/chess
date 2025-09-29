import type { EffectRef, Signal, WritableSignal } from '@angular/core';
import { untracked } from '@angular/core';
import { effect } from '@angular/core';
import { signal } from '@angular/core';
import { computed } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import type { AppStateType } from '@/app/store/states/app.state';
import { Store } from '@ngrx/store';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { selectFen, selectMoves } from '@/app/store/selectors/game.selectors';
import { DEFAULT_POSITION } from 'chess.js';

@Injectable({
  providedIn: 'root',
})
export class GameViewerService {
  public readonly atStart: Signal<boolean> = computed<boolean>(
    (): boolean => this.viewPlySignal() === 0,
  );
  public readonly atEnd: Signal<boolean> = computed<boolean>(
    (): boolean => this.viewPlySignal() === this.totalPly(),
  );
  public readonly isViewing: Signal<boolean> = computed<boolean>(
    (): boolean => !this.atEnd(),
  );

  // Находим fen, который надо отрисовать при просмотре
  public readonly viewFen: Signal<string> = computed<string>((): string => {
    const ply: number = this.viewPlySignal();
    const list: readonly MoveRecordType[] = this.moves();
    const total: number = list.length;

    if (ply <= 0) return DEFAULT_POSITION;
    if (ply < total) return list[ply - 1].fenAfter;
    return this.liveFen();
  });

  protected readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);

  // Актуальный fen с "хвоста" из стора (связан с бэком)
  protected readonly liveFen: Signal<string> =
    this.store.selectSignal(selectFen);

  protected readonly totalPly: Signal<number> = computed<number>(
    (): number => this.moves().length,
  );

  // Локальный указатель просмотра (иниц. на конце)
  protected readonly viewPlySignal: WritableSignal<number> = signal<number>(0);

  protected readonly moves: Signal<readonly MoveRecordType[]> =
    this.store.selectSignal(selectMoves);

  // при появлении нового хода "прыгаем" в конец
  protected readonly syncToEnd: EffectRef = effect((): void => {
    const total: number = this.totalPly();
    const current: number = untracked((): number => this.viewPlySignal());

    console.log('[syncToEnd] triggered');
    console.log('  totalPly =', total, 'viewPlySignal =', current);

    if (current < total) {
      console.log('  → updating viewPlySignal to', total);
      this.viewPlySignal.set(total);
    } else {
      console.log('  → already at end, nothing to do');
    }
  });

  public goStart(): void {
    if (!this.atStart()) this.viewPlySignal.set(0);
  }

  public goPrev(): void {
    const current: number = this.viewPlySignal();
    if (current > 0) this.viewPlySignal.set(current - 1);
  }

  public goNext(): void {
    const current: number = this.viewPlySignal();
    const end: number = this.totalPly();
    if (current < end) this.viewPlySignal.set(current + 1);
  }

  public goEnd(): void {
    const end: number = this.totalPly();
    if (!this.atEnd()) this.viewPlySignal.set(end);
  }
}
