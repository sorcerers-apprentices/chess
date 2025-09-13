import type {
  PieceColorType,
  PieceKindType,
} from '@/app/types/chess-square.type';

export const PIECE_ICON_URL: Record<
  PieceKindType,
  Record<PieceColorType, string>
> = {
  king: {
    white: 'assets/img/chess-piece/white/wK.svg',
    black: 'assets/img/chess-piece/black/bK.svg',
  },
  queen: {
    white: 'assets/img/chess-piece/white/wQ.svg',
    black: 'assets/img/chess-piece/black/bQ.svg',
  },
  rook: {
    white: 'assets/img/chess-piece/white/wR.svg',
    black: 'assets/img/chess-piece/black/bR.svg',
  },
  bishop: {
    white: 'assets/img/chess-piece/white/wB.svg',
    black: 'assets/img/chess-piece/black/bB.svg',
  },
  knight: {
    white: 'assets/img/chess-piece/white/wN.svg',
    black: 'assets/img/chess-piece/black/bN.svg',
  },
  pawn: {
    white: 'assets/img/chess-piece/white/wP.svg',
    black: 'assets/img/chess-piece/black/bP.svg',
  },
};
