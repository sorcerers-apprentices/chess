import type {
  NotationColor,
  NotationLetter,
} from '@/app/types/chess-type/chess-square.type';

export const PIECE_ICON_URL: Record<
  NotationLetter,
  Record<NotationColor, string>
> = {
  k: {
    w: 'assets/img/chess-piece/white/wK.svg',
    b: 'assets/img/chess-piece/black/bK.svg',
  },
  q: {
    w: 'assets/img/chess-piece/white/wQ.svg',
    b: 'assets/img/chess-piece/black/bQ.svg',
  },
  r: {
    w: 'assets/img/chess-piece/white/wR.svg',
    b: 'assets/img/chess-piece/black/bR.svg',
  },
  b: {
    w: 'assets/img/chess-piece/white/wB.svg',
    b: 'assets/img/chess-piece/black/bB.svg',
  },
  n: {
    w: 'assets/img/chess-piece/white/wN.svg',
    b: 'assets/img/chess-piece/black/bN.svg',
  },
  p: {
    w: 'assets/img/chess-piece/white/wP.svg',
    b: 'assets/img/chess-piece/black/bP.svg',
  },
};
