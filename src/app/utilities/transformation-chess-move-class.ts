import type { Move } from 'chess.js';
import type { StoredMove } from '@/app/types/store-game.type';

export function toStoredMove(move: Move): StoredMove {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,

    captured: move.captured,
    promotion: move.promotion,

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
