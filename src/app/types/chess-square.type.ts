export type SquareStateType = {
  square: SquareType;
  squareColor: SquareColorType;
  piece: PieceType | null;
};

export type SquareType = `${FileType}${RankType}`;

/** Фигура на доске: id обязателен */
export type PieceType = {
  id: string;
  color: ColorType;
  kind: PieceKindType;
};

export type ColorType = 'light' | 'dark';

export type ColorLightType = 'var(--tui-chart-categorical-18)';
export type ColorDarkType = 'var(--tui-background-accent-3)';
export type SquareColorType = ColorLightType | ColorDarkType;

export type PieceKindType =
  | 'king'
  | 'queen'
  | 'rook'
  | 'bishop'
  | 'knight'
  | 'pawn';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export type FileType = (typeof FILES)[number];

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

export type RankType = (typeof RANKS)[number];
