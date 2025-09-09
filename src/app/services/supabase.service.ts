import type {
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { inject, Injectable } from '@angular/core';
import { EnvironmentService } from './environment.service';
import type {
  SignInCredentials,
  SignUpCredentials,
} from '../types/sign-up.type';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly enviromentService = inject(EnvironmentService);
  private readonly apiUrl = this.enviromentService.apiUrl;
  private readonly publishableKey = this.enviromentService.publishableKey;
  private readonly redirectUrl = this.enviromentService.redirectURL;
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
