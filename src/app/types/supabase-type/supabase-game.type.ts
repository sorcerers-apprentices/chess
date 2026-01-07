export type GameResult = 'PENDING' | 'DRAW' | 'WHITE_WINS' | 'BLACK_WINS';

export type GameModel = {
  id: string;
  pgn: string;
  pgn_last: string;
  fen: string;
  player_id: string;
  created_at: string;
  finished: boolean;
  player_color: 'white' | 'black';
  result: GameResult;
  fen_final: string;
  timestamp: number;
};

export type GameProjection = {
  fen: string;
  pgn: string;
  pgn_last: string | null;
};
