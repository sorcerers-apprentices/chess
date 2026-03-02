import { inject, Injectable } from '@angular/core';
import type {
  SavedUserData,
  SignInCredentialsType,
  SignUpCredentialsType,
} from '@/app/types/sign-up.type';
import {
  type AuthResponse,
  type AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { environment } from '@/environments/environment.development';
import { LOCAL_STORAGE_KEY } from '@/app/constants/auth.constants';
import { SupabaseService } from '@/app/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly redirectUrl: string = environment.redirectURL;

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

  public async getUserId(): Promise<string | null> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) return null;

    return data.session?.user?.id ?? null;
  }

  public getUserData(): SavedUserData {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}';
    return JSON.parse(userData);
  }
}
