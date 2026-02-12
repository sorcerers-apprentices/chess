import type { Move, Piece, PieceSymbol } from 'chess.js';
import type {
  HistoryMoveVerbose,
  StoredMove,
} from '@/app/types/chess-type/chess-game.type';
import type {
  BoardMatrix,
  NotationPiece,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';

function toPromotionLetter(
  value: PieceSymbol | undefined,
): PromotionNotationLetter | undefined {
  if (!value) return undefined;

  if (value === 'q' || value === 'r' || value === 'b' || value === 'n') {
    return value;
  }
  throw new Error(`Invalid promotion piece: ${value}`);
}

export function chessBoardToBoardMatrix(
  chessBoard: (Piece | null)[][],
): BoardMatrix {
  return chessBoard.map((row: (Piece | null)[]): (NotationPiece | null)[] =>
    row.map((pieceOrNull: Piece | null): NotationPiece | null => {
      if (pieceOrNull === null) return null;

      return {
        color: pieceOrNull.color,
        type: pieceOrNull.type,
      };
    }),
  );
}

export function toStoredMove(move: Move): StoredMove {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,

    captured: move.captured,
    promotion: toPromotionLetter(move.promotion),

    san: move.san,
    uci: `${move.from}${move.to}${move.promotion ?? ''}`,

    before: move.before,
    after: move.after,

    isCapture: move.isCapture(),
    isPromotion: move.isPromotion(),
    isEnPassant: move.isEnPassant(),
    isKingsideCastle: move.isKingsideCastle(),
    isQueensideCastle: move.isQueensideCastle(),
    isBigPawn: move.isBigPawn(),
  };
}

export function toStoredMoveFromHistory(m: HistoryMoveVerbose): StoredMove {
  const flags = m.flags ?? '';

  return {
    color: m.color,
    from: m.from,
    to: m.to,
    piece: m.piece,

    captured: m.captured,
    promotion: toPromotionLetter(m.promotion),

    san: m.san,
    uci: `${m.from}${m.to}${m.promotion ?? ''}`,

    before: m.before,
    after: m.after,

    // flags в chess.js: 'c' capture, 'e' ep, 'p' promotion, 'k' king castle, 'q' queen castle, 'b' big pawn
    isCapture: flags.includes('c') || flags.includes('e') || m.captured != null,
    isPromotion: flags.includes('p') || m.promotion != null,
    isEnPassant: flags.includes('e'),
    isKingsideCastle: flags.includes('k'),
    isQueensideCastle: flags.includes('q'),
    isBigPawn: flags.includes('b'),
  };
}
