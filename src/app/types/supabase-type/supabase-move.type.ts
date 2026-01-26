import type {
  NotationColor,
  NotationLetter,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';
import type { MoveRecordType } from '@/app/store/states/game.state';
import type { StoredMove } from '@/app/types/chess-type/chess-game.type';
import {
  isBigPawnMove,
  isEnPassantFromRow,
  isKingsideCastleBySan,
  isQueensideCastleBySan,
  parseUci,
} from '@/app/utilities/mapping-date-from-move';

export type MoveDbRow = {
  id: string;
  game_id: string;
  ply: number;
  color: NotationColor;
  player_id: string | null;

  uci: string;
  san: string;

  piece: NotationLetter;
  captured: NotationLetter | null;
  promotion: PromotionNotationLetter | null;

  is_check: boolean;
  is_checkmate: boolean;

  fen_before: string;
  fen_after: string;

  created_at: string;
};

export type MoveDbInsert = {
  game_id: string;
  ply: number;
  color: NotationColor;
  player_id: string | null;

  uci: string;
  san: string;

  piece: NotationLetter;
  captured: NotationLetter | null;
  promotion: PromotionNotationLetter | null;

  is_check: boolean;
  is_checkmate: boolean;

  fen_before: string;
  fen_after: string;
};

export function toMoveDbInsert(
  gameId: string,
  record: MoveRecordType,
): MoveDbInsert {
  return {
    game_id: gameId,
    ply: record.ply,
    color: record.move.color,
    player_id: record.player_id,

    uci: record.move.uci,
    san: record.move.san,

    piece: record.move.piece,
    captured: record.move.captured ?? null,
    promotion: record.move.promotion ?? null,

    is_check: record.is_check,
    is_checkmate: record.is_checkmate,

    fen_before: record.move.before,
    fen_after: record.move.after,
  };
}

export function toMoveDbRow(row: MoveDbRow): MoveRecordType {
  const { from, to } = parseUci(row.uci);

  const isKingsideCastle = isKingsideCastleBySan(row.san);
  const isQueensideCastle = isQueensideCastleBySan(row.san);
  const isBigPawn = isBigPawnMove(row.piece, from, to);
  const isEnPassant = isEnPassantFromRow(
    row.piece,
    row.captured,
    from,
    to,
    row.fen_before,
  );

  const stored: StoredMove = {
    color: row.color,
    from,
    to,
    piece: row.piece,

    captured: row.captured ?? undefined,
    promotion: row.promotion ?? undefined,

    san: row.san,
    uci: row.uci,

    before: row.fen_before,
    after: row.fen_after,

    isCapture: row.captured != null,
    isPromotion: row.promotion != null,
    isEnPassant,
    isKingsideCastle,
    isQueensideCastle,
    isBigPawn,
  };

  return {
    move: stored,
    fenAfter: row.fen_after,
    ply: row.ply,
    player_id: row.player_id,
    is_check: row.is_check,
    is_checkmate: row.is_checkmate,
  };
}
