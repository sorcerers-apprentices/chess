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
export class SupabaseService {
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
}
