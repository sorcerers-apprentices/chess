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
import { RANKS } from '@/app/types/chess-square.type';
import { FILES } from '@/app/types/chess-square.type';
import { RANKS_TOP_DOWN } from '@/app/constants/chess-square.constans';
import { ChessSquare } from '@/app/components/chess-square/chess-square';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BoardSetupService } from '@/app/services/board-setup.service';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';

@Component({
  selector: 'app-chess-board',
  imports: [ChessSquare, ChessSquare, CdkDropListGroup],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessBoard {
  // emit event наверх, один раз на «успешный» DnD-ход: { from, to }.
  public readonly move = output<ChessMovePayloadType>();

  // emit event наверх, user начал перетаскивание фигуры с клетки
  public readonly dragStart = output<SquareType>();
  // emit event наверх, перетаскивание завершено (не важно, был drop или отмена)
  public readonly dragEnd = output<void>();

  public readonly fromSquare = input<SquareType | null>(null);
  public readonly allowedTargets = input<ReadonlySet<SquareType> | null>(null);

  // Массив файлов (a…h) для подписи оси X.
  protected readonly ranksUi = computed(() =>
    this.orientation() === 'white' ? RANKS_TOP_DOWN : RANKS,
  );
  // Массив рангов (8…1) для подписи оси Y в «верх-вниз».
  protected readonly filesUi = computed(() =>
    this.orientation() === 'white' ? FILES : [...FILES].reverse(),
  );

  protected readonly store = inject<Store<AppStateType>>(Store);

  protected readonly orientation = this.store.selectSignal(
    (state) => state.game.orientation,
  );

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

      const isAllowed =
        !!allow && from !== null && s.square !== from && allow.has(s.square);

      const isOverAllowed = isOver && isAllowed;
      const isOverDenied =
        isOver && from !== null && s.square !== from && !isAllowed;

      // возвращаем расширенный SquareUiStateType с флагами подсветок
      return { ...s, isFrom, isAllowed, isOverAllowed, isOverDenied };
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
    const from = this.dragFrom();
    const over = this.dragOver();
    const allowed: ReadonlySet<SquareType> | null = this.allowedTargets();

    const dropLooksValid: boolean =
      from !== null && over !== null && allowed !== null && allowed.has(over);

    if (dropLooksValid) {
      return;
    }

    this.dragFrom.set(null);
    this.dragOver.set(null);
    this.dragEnd.emit();
  }

  //клетка-цель сгенерировала итог события «фигура упала ко мне», и прислала payload { from, to }
  protected onSquareMove = (payload: ChessMovePayloadType): void => {
    this.dragFrom.set(null);
    this.dragOver.set(null);

    this.move.emit(payload);
    this.dragEnd.emit();
  };
}
