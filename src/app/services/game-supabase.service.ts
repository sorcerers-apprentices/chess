import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { GAME_ID } from '@/app/constants/auth.constants';
import type { GameModel } from '@/app/types/supabase-game.type';
import { Chess } from 'chess.js';
import type { MoveRecordType } from '@/app/store/states/game.state';
import type { GameResultType } from '@/app/services/game.service';

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
        player_id: playerId,
        player_color: playerColor,
        finished: false,
        fen_final: '',
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

  public async loadGame(): Promise<GameModel | null> {
    const gameId = this.getGameId();
    return await this.fetchGame(gameId);
  }

  public async move(moveRecord: MoveRecordType, pgn: string): Promise<void> {
    const gameId = this.getGameId();
    const game = await this.fetchGame(gameId);
    const oldPgn = game?.pgn;
    const chess = new Chess();
    chess.loadPgn(pgn);
    const fen = chess.fen();
    const { error } = await this.supabase
      .from('game')
      .update({
        fen: fen,
        pgn: pgn,
        pgn_last: oldPgn,
      })
      .eq('game_id', gameId);

    if (error) {
      console.error('Error moving piece:', error.message);
    }
  }

  public async undoMove(): Promise<void> {
    const gameId = this.getGameId();
    const game = await this.fetchGame(gameId);
    if (!game) {
      return;
    }

    const pgnOld = game.pgn_last;
    const pgnCurrent = game.pgn;
    const chess = new Chess();
    chess.loadPgn(pgnOld);
    const fen = chess.fen();

    const { error } = await this.supabase
      .from('game')
      .update({
        fen: fen,
        pgn: pgnOld,
        pgn_last: pgnCurrent,
      })
      .eq('game_id', gameId);

    if (error) {
      console.error('Error undoing move:', error?.message);
    }
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
      .eq('game_id', gameId);

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
