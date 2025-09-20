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
import type { Piece } from 'chess.js';

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
  public readonly piece = input<Piece | null>(null);
  //event попытка хода drop: { from, to }
  public readonly chessMove = output<ChessMovePayloadType>();

  // флаги подсветки — придут от родителя
  // источник перетягивания
  public readonly isFrom = input<boolean>(false);
  //курсор/фигура «над этой клеткой, ход разрешён».
  public readonly isOverAllowed = input<boolean>(false);
  // курсор/фигура «над этой клеткой, ход запрещён».
  public readonly isOverDenied = input<boolean>(false);

  public readonly fromSquare = input<SquareType | null>(null);
  public readonly allowedTargets = input<ReadonlySet<SquareType> | null>(null);

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
    return pieceIcon ? PIECE_ICON_URL[pieceIcon.type][pieceIcon.color] : '';
  });

  //Массив «подключённых» DropList (все клетки кроме себя). Используется в шаблоне на cdkDropListConnectedTo
  //Это позволяет ввозить/вывозить drag в любую другую клетку.
  protected readonly connectedToIds = computed(() =>
    this.allSquares().filter((id) => id !== this.square()),
  );

  // Альт-текст для иконки фигуры
  protected readonly altText = computed(() => {
    const pieceAltText = this.piece();
    return pieceAltText ? `${pieceAltText.color} ${pieceAltText.type}` : '';
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
    this.dragStartSquare.emit(this.square());
  }
  public handleDragEnter(): void {
    this.dragEnterSquare.emit(this.square());
  }
  public handleDragEnd(): void {
    this.dragEndSquare.emit();
  }

  // функция-предикат для cdkDropListEnterPredicate. Она решает: пускать ли текущий Drag в эту DropList.
  public readonly canEnter = (
    drag: CdkDrag<DragDataType>,
    drop: CdkDropList<DropDataType>,
  ): boolean => {
    const allow = this.allowedTargets();
    const from = this.fromSquare();
    const here = drop.data?.square;

    const dragData = drag.data;
    const dropData = drop.data;

    if (!isDragData(dragData) || !isDropData(dropData)) return false;
    if (dragData.fromSquare === here) return false;
    if (dropData.piece && dropData.piece.color === dragData.piece.color)
      return false;

    // если allow/from ещё не приехали — пускаем по дефолту
    const canByDefault = allow == null || from == null;
    if (canByDefault) return true;

    // обычное правило, когда всё уже есть
    return allow.has(here) && dragData.fromSquare === from;
  };

  public onDrop(
    event: CdkDragDrop<DropDataType, DropDataType, DragDataType>,
  ): void {
    const dragged = event.item?.data;
    const target = event.container?.data;

    if (!isDragData(dragged) || !isDropData(target)) return;

    // игнор, если бросили в ту же клетку
    if (dragged.fromSquare === target.square) return;

    // тут НЕТ шахматной валидации — только событие UX.
    // шахматные правила пусть проверяет родитель/сервис с chess.js.
    const movePayload = { from: dragged.fromSquare, to: target.square };
    this.chessMove.emit(movePayload);
  }
}
