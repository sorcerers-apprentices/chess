import type {
  NotationColor,
  NotationLetter,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';

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
