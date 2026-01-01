import type { Move } from 'chess.js';
import type {
  HistoryMoveVerbose,
  StoredMove,
} from '@/app/types/store-game.type';

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

export function toStoredMoveFromHistory(m: HistoryMoveVerbose): StoredMove {
  const flags = m.flags ?? '';

  return {
    color: m.color,
    from: m.from,
    to: m.to,
    piece: m.piece,

    captured: m.captured,
    promotion: m.promotion,

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
