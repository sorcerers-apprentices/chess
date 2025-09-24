export type GameResult = 'PENDING' | 'DRAW' | 'WHITE_WINS' | 'BLACK_WINS';

export type GameModel = {
  id: string;
  pgn: string;
  pgn_last: string;
  fen: string;
  playerId: string;
  created_at: Date;
  finished: boolean;
  playerColor: 'white' | 'black';
  result: GameResult;
  finalFen: string;
};
