import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentService } from './environment-service/environment.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  protected enviromentService = inject(EnvironmentService);
  protected apiUrl = this.enviromentService.apiUrl;
  protected publishableKey = this.enviromentService.publishableKey;

  public supabase: SupabaseClient = createClient(this.apiUrl, this.publishableKey);

  async signup(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password })
  }

  async signin(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password })
  }
}
