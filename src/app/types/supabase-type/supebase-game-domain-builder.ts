import type { GameModel } from '@/app/types/supabase-type/supabase-game.type';
import type {
  GameDomainType,
  MoveRecordType,
} from '@/app/store/states/game.state';
import type { GameResultType } from '@/app/services/game.service';

export function buildGameDomain(
  game: GameModel,
  moveRecords: MoveRecordType[],
): GameDomainType {
  const last = moveRecords.at(-1);

  const result: GameResultType | null =
    game.result === 'DRAW'
      ? { winner: null, draw: true }
      : game.result === 'WHITE_WINS'
        ? { winner: 'white', draw: false }
        : game.result === 'BLACK_WINS'
          ? { winner: 'black', draw: false }
          : { winner: null, draw: false };

  return {
    id: game.id,
    fen: game.fen,
    pgn: game.pgn,
    pgnLast: game.pgn_last,

    moves: moveRecords,
    undoneMoves: [],

    lastMove: last ? { from: last.move.from, to: last.move.to } : null,

    orientation: game.player_color,
    finished: game.finished,
    result,
    finalFen: game.fen_final,
  };
}
