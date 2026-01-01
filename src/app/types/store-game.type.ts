// StoredMove — сериализуемый, стабильный, без методов
import type { Color, PieceSymbol, Square } from 'chess.js';

export type StoredMove = {
  color: Color; // 'w' | 'b'
  from: Square; // например 'a2'
  to: Square; // например 'a4'
  piece: PieceSymbol; // 'p','n','b','r','q','k'

  captured?: PieceSymbol;
  promotion?: PieceSymbol;

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
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  before: string;
  after: string;
  flags?: string;
};
