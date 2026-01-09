import type {
  NotationColor,
  NotationLetter,
  NotationSquare,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';

export type StoredMove = {
  color: NotationColor; // 'w' | 'b'
  from: NotationSquare; // например 'a2'
  to: NotationSquare; // например 'a4'
  piece: NotationLetter; // 'p','n','b','r','q','k'

  captured?: NotationLetter;
  promotion?: PromotionNotationLetter;

  san: string; // "a4", "Nf3", "O-O" и т.д.
  uci: string; // "a2a4", "e7e8q" (можно вычислять, но удобно хранить)

  before: string; // FEN
  after: string; // FEN

  // Нормализованные признаки вместо flags-строки
  isCapture: boolean;
  isPromotion: boolean;
  isEnPassant: boolean;
  isKingsideCastle: boolean;
  isQueensideCastle: boolean;
  isBigPawn: boolean;
};

export type HistoryMoveVerbose = {
  color: NotationColor;
  from: NotationSquare;
  to: NotationSquare;
  piece: NotationLetter;
  captured?: NotationLetter;
  promotion?: NotationLetter;
  san: string;
  before: string;
  after: string;
  flags?: string;
};
