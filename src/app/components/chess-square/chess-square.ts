import type { Signal } from '@angular/core';
import { output } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type {
  SquareType,
  SquareColorType,
  PieceType,
} from '@/app/types/chess-square.type';

import { PIECE_ICON_URL } from '@/app/constants/chess-piece.constans';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type {
  ChessMovePayloadType,
  DragDataType,
  DropDataType,
} from '@/app/types/drag-drop-data.type';
import { isDragData, isDropData } from '@/app/utilities/chess-piece';

@Component({
  selector: 'app-chess-square',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './chess-square.html',
  styleUrl: './chess-square.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessSquare {
  // координата клетки (id)
  public readonly square = input.required<SquareType>();
  //фон клетки
  public readonly backgroundColor = input.required<SquareColorType>();
  // объект фигуры в клетке (id, цвет, что за фигура)
  public readonly piece = input<PieceType | null>(null);
  //event попытка хода drop: { from, to }
  public readonly chessMove = output<ChessMovePayloadType>();

  // флаги подсветки — придут от родителя
  // источник перетягивания
  public readonly isFrom = input<boolean>(false);
  //курсор/фигура «над этой клеткой, ход разрешён».
  public readonly isOverAllowed = input<boolean>(false);
  // курсор/фигура «над этой клеткой, ход запрещён».
  public readonly isOverDenied = input<boolean>(false);

  // добавляем события для родителя
  // старт с этой клетки а4 h5
  public readonly dragStartSquare = output<SquareType>();
  // перешли на эту клетку
  public readonly dragEnterSquare = output<SquareType>();
  // поставили (успешно или отменили)
  public readonly dragEndSquare = output<void>();

  // Список всех клеток доски (координат) чтобы сконфигурировать «с кем связана» текущая cdkDropList (клетка)
  public readonly allSquares = input.required<readonly SquareType[]>();

  // От фигуры → к URL иконки: PIECE_ICON_URL[kind][color] или пустая строка, если фигуры нет. Идёт в <img [src]>
  protected readonly icon: Signal<string> = computed(() => {
    const pieceIcon = this.piece();
    return pieceIcon ? PIECE_ICON_URL[pieceIcon.kind][pieceIcon.color] : '';
  });

  //Массив «подключённых» DropList (все клетки кроме себя). Используется в шаблоне на cdkDropListConnectedTo
  //Это позволяет ввозить/вывозить drag в любую другую клетку.
  protected readonly connectedToIds = computed(() =>
    this.allSquares().filter((id) => id !== this.square()),
  );

  // Альт-текст для иконки фигуры
  protected readonly altText = computed(() => {
    const pieceAltText = this.piece();
    return pieceAltText ? `${pieceAltText.color} ${pieceAltText.kind}` : '';
  });

  // Флаг «в клетке есть фигура»
  protected readonly hasPiece = computed(() => this.piece() !== null);

  // Данные, которые CDK будет «таскать»: { piece, fromSquare } или null, если нечего тащить.
  //DragDataType Что тащим (источник)
  protected readonly dragData: Signal<DragDataType | null> =
    computed<DragDataType | null>(() => {
      const pieceDrag = this.piece();
      return pieceDrag ? { piece: pieceDrag, fromSquare: this.square() } : null;
    });

  // Данные целевой DropList: куда бросаем (клетка square) и кто там сейчас лежит (piece | null).
  // DropDataType Куда бросаем (цель)
  protected readonly dropData = computed<DropDataType>(() => ({
    square: this.square(),
    piece: this.piece(),
  }));

  // хендлеры без логики
  public handleDragStart(): void {
    console.log('[ChessSquare] dragStart', this.square());
    this.dragStartSquare.emit(this.square());
  }
  public handleDragEnter(): void {
    console.log('[ChessSquare] dragEnter', this.square());
    this.dragEnterSquare.emit(this.square());
  }
  public handleDragEnd(): void {
    console.log('[ChessSquare] dragEnd', this.square());
    this.dragEndSquare.emit();
  }

  // функция-предикат для cdkDropListEnterPredicate. Она решает: пускать ли текущий Drag в эту DropList.
  public readonly canEnter = (
    drag: CdkDrag<DragDataType>,
    drop: CdkDropList<DropDataType>,
  ): boolean => {
    const dragData = drag.data;
    const dropData = drop.data;

    const isAllowed =
      isDragData(dragData) &&
      isDropData(dropData) &&
      dragData.fromSquare !== dropData.square;

    console.log(
      '[ChessSquare] canEnter? from=',
      isDragData(dragData) ? dragData.fromSquare : 'X',
      'to=',
      isDropData(dropData) ? dropData.square : 'X',
      '=>',
      isAllowed,
    );

    return isAllowed;
  };

  public onDrop(
    event: CdkDragDrop<DropDataType, DropDataType, DragDataType>,
  ): void {
    console.log('[ChessSquare] onDrop', {
      from: event.item?.data,
      to: event.container?.data,
    });

    const dragged = event.item?.data;
    const target = event.container?.data;

    if (!isDragData(dragged) || !isDropData(target)) return;

    // игнор, если бросили в ту же клетку
    if (dragged.fromSquare === target.square) return;

    // тут НЕТ шахматной валидации — только событие UX.
    // шахматные правила пусть проверяет родитель/сервис с chess.js.
    this.chessMove.emit({ from: dragged.fromSquare, to: target.square });
  }
}
