import type {
  PieceColorType,
  PieceKindType,
} from '@/app/types/chess-square.type';

export const PIECE_ICON_URL: Record<
  PieceKindType,
  Record<PieceColorType, string>
> = {
  king: {
    light: 'assets/img/chess-piece/white/wK.svg',
    dark: 'assets/img/chess-piece/black/bK.svg',
  },
  queen: {
    light: 'assets/img/chess-piece/white/wQ.svg',
    dark: 'assets/img/chess-piece/black/bQ.svg',
  },
  rook: {
    light: 'assets/img/chess-piece/white/wR.svg',
    dark: 'assets/img/chess-piece/black/bR.svg',
  },
  bishop: {
    light: 'assets/img/chess-piece/white/wB.svg',
    dark: 'assets/img/chess-piece/black/bB.svg',
  },
  knight: {
    light: 'assets/img/chess-piece/white/wN.svg',
    dark: 'assets/img/chess-piece/black/bN.svg',
  },
  pawn: {
    light: 'assets/img/chess-piece/white/wP.svg',
    dark: 'assets/img/chess-piece/black/bP.svg',
  },
};
