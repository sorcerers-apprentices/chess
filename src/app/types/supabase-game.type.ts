type GameResult = 'PENDING' | 'DRAW' | 'WHITE_WINS' | 'BLACK_WINS';
export type BoardCell = { file: string; rank: number };

export type GameModel = {
  id: string;
  created_at: Date;
  whitePlayerId: string;
  blackPlayerId: string;
  result: GameResult;
};

export type MoveModel = {
  gameId: string;
  from: BoardCell;
  to: BoardCell;
  uci: string;
  san: string;
  fenAfter: string;
  timestamp?: number;
  piece: string;
  captured: string;
  promotion: string;
};
