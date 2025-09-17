import { Injectable } from '@angular/core';
import type {
  SignInCredentialsType,
  SignUpCredentialsType,
} from '@/app/types/sign-up.type';
import {
  type AuthResponse,
  type AuthTokenResponsePassword,
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '@/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly publishableKey = environment.publishableKey;
  private readonly redirectUrl = environment.redirectURL;
  private readonly supabase: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );
  public async signup(
    credentials: SignUpCredentialsType,
  ): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName,
          phone: credentials.phone,
        },
        emailRedirectTo: this.redirectUrl,
      },
    });
  }

  public async signin(
    credentials: SignInCredentialsType,
  ): Promise<AuthTokenResponsePassword> {
    return await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
  }
}
