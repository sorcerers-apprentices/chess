import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { GAME_ID } from '@/app/constants/auth.constants';
import type { GameModel, GameProjection } from '@/app/types/supabase-game.type';
import { Chess } from 'chess.js';
import type { GameResultType } from '@/app/services/game.service';
import { clone } from '@/app/utilities/chess-piece';
import type { MoveRecordType } from '@/app/store/states/game.state';

@Injectable({
  providedIn: 'root',
})
export class GameSupabaseService {
  private readonly apiUrl = environment.apiUrl;
  private readonly publishableKey = environment.publishableKey;
  private readonly supabase: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );

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

    this.setGameId(data.id);
    return data.id;
  }

  public async loadGame(gameId: string): Promise<GameModel | null> {
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

  public async move(chess: Chess, moveRecord: MoveRecordType): Promise<void> {
    const gameId = this.getGameId();
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

  public async undoMove(): Promise<GameProjection> {
    const gameId = this.getGameId();
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
    storeResult: GameResultType,
    finalFen: string,
  ): Promise<void> {
    const gameId = this.getGameId();
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
      console.error('Error undoing move:', error?.message);
    }
  }

  private setGameId(id: string | null): void {
    if (id == null) {
      return;
    }
    localStorage.setItem(GAME_ID, id);
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

  private getGameId(): string {
    return localStorage.getItem(GAME_ID) ?? '';
  }
}
