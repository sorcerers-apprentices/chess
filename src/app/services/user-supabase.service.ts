import type {
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@angular/core';
import type {
  SignInCredentials,
  SignUpCredentials,
} from '../types/sign-up.type';
import { environment } from '@/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserSupabaseService {
  private readonly apiUrl = environment.apiUrl;
  private readonly publishableKey = environment.publishableKey;
  private readonly redirectUrl = environment.redirectURL;
  private readonly supabase: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );

  public async signup(credentials: SignUpCredentials): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          username: credentials.username,
          phone: credentials.phone,
        },
        emailRedirectTo: this.redirectUrl,
      },
    });
  }

  public async signin(
    credentials: SignInCredentials,
  ): Promise<AuthTokenResponsePassword> {
    return await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
  }

  public async fetchUsernameExists(username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_data')
      .select('username')
      .eq('username', username);

    if (error) {
      console.error('Error fetching data:', error.message);
      return false;
    }

    return data?.length !== 0;
  }

  public async fetchUserData(userId: string): Promise<UserData | null> {
    const { data, error } = await this.supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }

    return data[0];
  }

  public async fetchGamesCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('game')
      .select('*', { count: 'exact', head: true })
      .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`);

    if (error || count === null) {
      console.error('Error fetching data:', error?.message);
      return 0;
    }

    return +count;
  }

  public async fetchWinedGamesCount(userId: string): Promise<number> {
    const { count: countW, error: errorW } = await this.supabase
      .from('game')
      .select('*', { count: 'exact', head: true })
      .eq('white_player_id', userId)
      .eq('result', 'WHITE_WINS');
    const { count: countB, error: errorB } = await this.supabase
      .from('game')
      .select('*', { count: 'exact', head: true })
      .eq('black_player_id', userId)
      .eq('result', 'BLACK_WINS');

    if (errorW || errorB || countW === null || countB === null) {
      console.error('Error fetching data: ', errorW?.message, errorB?.message);
      return 0;
    }

    return countW + countB;
  }
}
type UserData = { username: string };
