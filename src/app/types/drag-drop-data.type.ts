import type {
  NotationPiece,
  NotationSquare,
} from '@/app/types/chess-type/chess-square.type';

/** Что тащим (источник) */
export type DragDataType = {
  piece: NotationPiece;
  fromSquare: NotationSquare;
};

/** Куда бросаем (цель) */
export type DropDataType = {
  square: NotationSquare;
  piece: NotationPiece | null;
};

export type ChessMovePayloadType = {
  from: NotationSquare;
  to: NotationSquare;
};
