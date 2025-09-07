import type {
  AuthResponse,
  SupabaseClient,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { inject, Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public enviromentService = inject(EnvironmentService);
  public apiUrl = this.enviromentService.apiUrl;
  public publishableKey = this.enviromentService.publishableKey;
  public redirectUrl = this.enviromentService.redirectURL;

  public supabase: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );

  public async signup(
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResponse> {
    const options = {
      data: { username },
      emailRedirectTo: this.redirectUrl,
    };
    const credentials = { email, password, options };
    return await this.supabase.auth.signUp(credentials);
  }

  public async signin(
    email: string,
    password: string,
  ): Promise<AuthTokenResponsePassword> {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }
}
