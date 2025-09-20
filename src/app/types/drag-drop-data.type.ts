import type { SquareType } from '@/app/types/chess-square.type';
import type { Piece } from 'chess.js';

/** Что тащим (источник) */
export type DragDataType = {
  piece: Piece;
  fromSquare: SquareType;
};

/** Куда бросаем (цель) */
export type DropDataType = {
  square: SquareType;
  piece: Piece | null;
};

export type ChessMovePayloadType = {
  from: SquareType;
  to: SquareType;
};
