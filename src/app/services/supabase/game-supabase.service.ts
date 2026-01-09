import { inject, Injectable } from '@angular/core';
import type {
  GameModel,
  GameProjection,
} from '@/app/types/supabase-type/supabase-game.type';
import { Chess } from 'chess.js';
import type { GameResultType } from '@/app/services/game.service';
import { clone } from '@/app/utilities/chess-piece';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { SupabaseService } from '@/app/services/supabase/supabase.service';
import type {
  MoveDbInsert,
  MoveDbRow,
} from '@/app/types/supabase-type/supabase-move.type';

@Injectable({
  providedIn: 'root',
})
export class GameSupabaseService {
  private readonly supabase = inject(SupabaseService).client;

  public async createGame(
    playerId: string,
    playerColor: 'white' | 'black',
    initialFen: string,
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('game')
      .insert({
        fen: initialFen,
        pgn: new Chess(initialFen).pgn(),
        player_id: playerId,
        player_color: playerColor,
        finished: false,
        fen_final: '',
        timestamp: 0,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating game:', error.message);
      return null;
    }

    //this.rememberGameIdLS(data.id);
    return data.id;
  }

  public async loadGame(gameId: string): Promise<GameModel | null> {
    //this.rememberGameIdLS(gameId);
    return await this.fetchGame(gameId);
  }

  public async setElo(elo: number, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profile')
      .update({
        elo: elo,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error creating game:', error.message);
    }
  }

  public async move(
    gameId: string,
    chess: Chess,
    moveRecord: MoveRecordType,
  ): Promise<void> {
    const game = await this.fetchGame(gameId);
    const oldPgn = game?.pgn;

    const { error } = await this.supabase
      .from('game')
      .update({
        fen: clone(chess).fen(),
        pgn: clone(chess).pgn(),
        pgn_last: oldPgn,
        timestamp: moveRecord.timestamp,
      })
      .eq('id', gameId);

    if (error) {
      console.error('Error moving piece:', error.message);
    }
  }

  public async toggleMove(gameId: string): Promise<GameProjection> {
    const game = await this.fetchGame(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const pgnOld = game.pgn_last;
    const pgnCurrent = game.pgn;
    const chess = new Chess();
    chess.loadPgn(pgnOld);
    const fen = chess.fen();

    const { data, error } = await this.supabase
      .from('game')
      .update({
        fen: fen,
        pgn: pgnOld,
        pgn_last: pgnCurrent,
      })
      .eq('id', gameId)
      .select('fen,pgn,pgn_last')
      .single();

    if (error) {
      console.error('Error undoing move:', error?.message);
    }
    if (data == null) {
      throw new Error('Row not found after update');
    }

    return data;
  }

  public async gameOver(
    gameId: string,
    storeResult: GameResultType,
    finalFen: string,
  ): Promise<void> {
    const result = storeResult.draw
      ? 'DRAW'
      : storeResult.winner === 'white'
        ? 'WHITE_WINS'
        : storeResult.winner === 'black'
          ? 'BLACK_WINS'
          : 'PENDING';
    const { error } = await this.supabase
      .from('game')
      .update({
        fen_final: finalFen,
        result: result,
        finished: true,
      })
      .eq('id', gameId);

    if (error) {
      throw new Error(error.message);
    }
  }

  public async insertMove(row: MoveDbInsert): Promise<MoveDbRow | null> {
    const { data, error } = await this.supabase
      .from('move')
      .insert(row)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting move:', error.message);
      return null;
    }

    return data;
  }

  private async fetchGame(id: string): Promise<GameModel | null> {
    const { data, error } = await this.supabase
      .from('game')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }

    return data[0];
  }
}
