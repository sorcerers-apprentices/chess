import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BoardSetupService } from '@/app/services/board-setup.service';

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

  public readonly fromSquare = input<SquareType | null>(null);
  public readonly allowedTargets = input<ReadonlySet<SquareType> | null>(null);

  // Массив файлов (a…h) для подписи оси X.
  protected readonly files = FILES;
  // Массив рангов (8…1) для подписи оси Y в «верх-вниз».
  protected readonly ranks = RANKS_TOP_DOWN;

  //список id клеток в текущей разметке передается в клетку
  protected readonly allSquareIds = computed(() =>
    this.squares().map((s) => s.square),
  );

  // ДОСКА сама собирает базовые 64 клетки из движка через BoardSetupService
  protected readonly boardSetup = inject(BoardSetupService);

  /** Сигнал с клетками для отрисовки - источник правды для шаблона по клеткам. На вход берёт три сигнала*/
  protected readonly squares = computed<readonly SquareUiStateType[]>(() => {
    const baseBoard = this.boardSetup.squaresBoard();

    const fromLocal = this.dragFrom();
    const fromExternal = this.fromSquare();
    const over = this.dragOver();
    const allow = this.allowedTargets(); // разрешённые цели (или null).

    const from = fromExternal ?? fromLocal;

    //мапит базовое состояние из boardStateUI.squares() и рассчитывает три флага подсветки
    return baseBoard.map((s) => {
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
    this.move.emit(payload);
  };
}
