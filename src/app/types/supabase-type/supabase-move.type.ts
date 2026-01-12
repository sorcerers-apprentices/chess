import type {
  NotationColor,
  NotationLetter,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';
import type { MoveRecordType } from '@/app/store/states/game.state';

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
