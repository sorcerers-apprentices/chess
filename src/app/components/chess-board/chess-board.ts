import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  SquareType,
  SquareUiStateType,
} from '@/app/types/chess-square.type';
import { FILES } from '@/app/types/chess-square.type';
import { RANKS_TOP_DOWN } from '@/app/constants/chess-square.constans';
import { ChessSquare } from '@/app/components/chess-square/chess-square';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';
import { BoardStateService } from '@/app/services/board-state.service';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-chess-board',
  imports: [ChessSquare, ChessSquare, CdkDropListGroup],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessBoard {
  public readonly orientation = input.required<BoardOrientationType>();
  public readonly move = output<ChessMovePayloadType>();

  public readonly dragStart = output<SquareType>();
  public readonly dragEnd = output<void>();

  protected readonly files = FILES;
  protected readonly ranks = RANKS_TOP_DOWN;

  protected readonly boardStateUI = inject(BoardStateService);

  // 🔹 Добавляем локальный сигнал: пока null (поведение как у тебя сейчас)
  protected readonly allowedTargets = signal<ReadonlySet<SquareType> | null>(
    null,
  );

  protected readonly allSquareIds = computed(
    () => this.squares().map((s) => s.square), // ['a1', 'b1', ..., 'h8']
  );

  /** Сигнал с клетками для отрисовки */
  protected readonly squares = computed<readonly SquareUiStateType[]>(() => {
    const from = this.dragFrom();
    const over = this.dragOver();
    const allow = this.allowedTargets();

    return this.boardStateUI.squares().map((s) => {
      const isFrom = from === s.square;
      const isOver = over === s.square;

      // 🔹 единое правило: если allow=null → как раньше (разрешено всё, кроме from)
      const canDropHere =
        from !== null &&
        s.square !== from &&
        (allow ? allow.has(s.square) : true);

      const isOverAllowed = isOver && canDropHere;
      const isOverDenied = isOver && !canDropHere;

      return { ...s, isFrom, isOverAllowed, isOverDenied };
    });
  });

  // подсветка DnD
  private readonly dragFrom = signal<SquareType | null>(null);
  private readonly dragOver = signal<SquareType | null>(null);

  constructor() {
    // инициализация доски при изменении ориентации
    effect(() => {
      this.boardStateUI.init(this.orientation());
    });
  }

  public onDragStart(square: SquareType): void {
    this.dragFrom.set(square);
    this.dragOver.set(null);
    this.dragStart.emit(square);
  }

  public onDragEnter(square: SquareType): void {
    this.dragOver.set(square);
  }

  public onDragEnd(): void {
    this.dragFrom.set(null);
    this.dragOver.set(null);
    this.dragEnd.emit();
  }

  protected onSquareMove = (e: ChessMovePayloadType): void => {
    // пока лог и сброс подсветки
    console.log('[ChessBoard] DND move payload', e);

    this.dragFrom.set(null);
    this.dragOver.set(null);

    // диспатч хода в BoardStateService
    this.boardStateUI.movePiece(e);

    this.move.emit(e);
  };
}
