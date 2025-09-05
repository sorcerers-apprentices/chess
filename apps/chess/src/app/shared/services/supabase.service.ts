import { inject, Injectable } from '@angular/core';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
  SupabaseClient,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { EnvironmentService } from './environment-service/environment.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public enviromentService = inject(EnvironmentService);
  public apiUrl = this.enviromentService.apiUrl;
  public publishableKey = this.enviromentService.publishableKey;

  public supabase: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );

  public async signup(email: string, password: string): Promise<AuthResponse> {
    return await this.supabase.auth.signUp({ email, password });
  }

  public async signin(
    email: string,
    password: string,
  ): Promise<AuthTokenResponsePassword> {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }
}
