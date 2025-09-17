import type { PieceType, SquareType } from '@/app/types/chess-square.type';

/** Что тащим (источник) */
export type DragDataType = {
  piece: PieceType;
  fromSquare: SquareType;
};

/** Куда бросаем (цель) */
export type DropDataType = {
  square: SquareType;
  piece: PieceType | null;
};

export type ChessMovePayloadType = {
  from: SquareType;
  to: SquareType;
};
