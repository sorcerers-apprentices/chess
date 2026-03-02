import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment.development';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public readonly apiUrl: string = environment.apiUrl;
  public readonly publishableKey: string = environment.publishableKey;

  public readonly client: SupabaseClient = createClient(
    this.apiUrl,
    this.publishableKey,
  );
}
