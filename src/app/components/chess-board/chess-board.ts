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
  // emit event наверх, один раз на «успешный» DnD-ход: { from, to }.
  public readonly move = output<ChessMovePayloadType>();

  // emit event наверх, user начал перетаскивание фигуры с клетки
  public readonly dragStart = output<SquareType>();
  // emit event наверх, перетаскивание завершено (не важно, был drop или отмена)
  public readonly dragEnd = output<void>();

  // Массив файлов (a…h) для подписи оси X.
  protected readonly files = FILES;
  // Массив рангов (8…1) для подписи оси Y в «верх-вниз».
  protected readonly ranks = RANKS_TOP_DOWN;

  protected readonly boardStateUI = inject(BoardStateService);

  // Добавляем локальный сигнал: пока null
  protected readonly allowedTargets = signal<ReadonlySet<SquareType> | null>(
    null,
  );

  //список id клеток в текущей разметке передается в клетку
  protected readonly allSquareIds = computed(() =>
    this.squares().map((s) => s.square),
  );

  /** Сигнал с клетками для отрисовки - источник правды для шаблона по клеткам. На вход берёт три сигнала*/
  protected readonly squares = computed<readonly SquareUiStateType[]>(() => {
    const from = this.dragFrom();
    const over = this.dragOver();
    const allow = this.allowedTargets(); // разрешённые цели (или null).

    //мапит базовое состояние из boardStateUI.squares() и рассчитывает три флага подсветки
    return this.boardStateUI.squares().map((s) => {
      const isFrom = from === s.square;
      const isOver = over === s.square;

      // единое правило: если allow=null → как раньше (разрешено всё, кроме from)
      const canDropHere =
        from !== null &&
        s.square !== from &&
        (allow ? allow.has(s.square) : true);

      const isOverAllowed = isOver && canDropHere;
      const isOverDenied = isOver && !canDropHere;

      // возвращаем расширенный SquareUiStateType с флагами подсветок
      return { ...s, isFrom, isOverAllowed, isOverDenied };
    });
  });

  // подсветка DnD
  //Какая клетка стала источником DnD (когда подняли фигуру). null — ничего не тянем
  private readonly dragFrom = signal<SquareType | null>(null);
  // Какую клетку сейчас подсвечиваем по ходу DnD.
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

  //клетка-цель сгенерировала итог события «фигура упала ко мне», и прислала payload { from, to }
  protected onSquareMove = (payload: ChessMovePayloadType): void => {
    this.dragFrom.set(null);
    this.dragOver.set(null);

    // применяем ход к UI-состоянию (фигуры на доске реально переезжают в сервисе)
    this.boardStateUI.movePiece(payload);

    this.move.emit(payload);
  };
}
