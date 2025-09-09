export type SquareState = {
  square: Square;
  squareColor: SquareColor;
  piece: Piece | null;
};

export type Square = `${File}${Rank}`;

/** Фигура на доске: id обязателен */
export type Piece = {
  id: string;
  kind: PieceKind;
  color: Color;
};

export type Color = 'light' | 'dark';

export type ColorLight = 'var(--tui-chart-categorical-18)';
export type ColorDark = 'var(--tui-background-accent-3)';
export type SquareColor = ColorLight | ColorDark;

export type PieceKind =
  | 'king'
  | 'queen'
  | 'rook'
  | 'bishop'
  | 'knight'
  | 'pawn';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export type File = (typeof FILES)[number];

export const RANK_1 = 1;
export const RANK_2 = 2;
export const RANK_3 = 3;
export const RANK_4 = 4;
export const RANK_5 = 5;
export const RANK_6 = 6;
export const RANK_7 = 7;
export const RANK_8 = 8;

export const RANKS = [
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
] as const;

export type Rank = (typeof RANKS)[number];
