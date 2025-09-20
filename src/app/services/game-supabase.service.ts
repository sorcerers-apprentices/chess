import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment.development';
import { GAME_ID } from '@/app/constants/auth.constants';

type BoardCell = { file: string; rank: number };

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
    whitePlayerId: string,
    blackPlayerId: string,
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('game')
      .insert({
        white_player_id: whitePlayerId,
        black_player_id: blackPlayerId,
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

  public async move(
    gameId: string,
    from: BoardCell,
    to: BoardCell,
  ): Promise<void> {
    const { error } = await this.supabase.from('move').insert({
      game_id: gameId,
      from_file: from.file,
      from_rank: from.rank,
      to_file: to.file,
      to_rank: to.rank,
    });

    if (error) {
      console.error('Error moving piece:', error.message);
    }
  }

  public async undoMove(gameId: string): Promise<void> {
    const { error } = await this.supabase.rpc('create_profile_for_new_user', {
      game_id: gameId,
    });

    if (error) {
      console.error('Error undoing move:', error?.message);
    }
  }

  public setGameId(id: string | null): void {
    if (id == null) {
      return;
    }
    localStorage.setItem(GAME_ID, id);
  }

  public getGameId(): string {
    return localStorage.getItem(GAME_ID) ?? '';
  }
}
