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
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import type {
  ChessMovePayloadType,
  DragDataType,
  DropDataType,
} from '@/app/types/drag-drop-data.type';
import { isDragData, isDropData } from '@/app/utilities/chess-piece';

@Component({
  selector: 'app-chess-square',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './chess-square.html',
  styleUrl: './chess-square.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessSquare {
  public readonly square = input.required<SquareType>();
  public readonly backgroundColor = input.required<SquareColorType>();
  public readonly piece = input<PieceType | null>(null);
  public readonly chessMove = output<ChessMovePayloadType>();

  // флаги подсветки — придут от родителя
  public readonly isFrom = input<boolean>(false);
  public readonly isOverAllowed = input<boolean>(false);
  public readonly isOverDenied = input<boolean>(false);
  // добавляем события для родителя
  public readonly dragStartSquare = output<SquareType>();
  public readonly dragEnterSquare = output<SquareType>();
  public readonly dragEndSquare = output<void>();

  public readonly allSquares = input.required<readonly SquareType[]>();

  protected readonly icon: Signal<string> = computed(() => {
    const p = this.piece();
    return p ? PIECE_ICON_URL[p.kind][p.color] : '';
  });

  protected readonly connectedToIds = computed(() =>
    this.allSquares().filter((id) => id !== this.square()),
  );

  protected readonly altText = computed(() => {
    const p = this.piece();
    return p ? `${p.color} ${p.kind}` : '';
  });

  protected readonly hasPiece = computed(() => this.piece() !== null);

  protected readonly dragData: Signal<DragDataType | null> =
    computed<DragDataType | null>(() => {
      const pieceDrag = this.piece();
      return pieceDrag ? { piece: pieceDrag, fromSquare: this.square() } : null;
    });

  protected readonly dropData = computed<DropDataType>(() => ({
    square: this.square(),
    piece: this.piece(),
  }));

  // тонкие хендлеры без логики
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
