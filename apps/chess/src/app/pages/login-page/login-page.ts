import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected fb = inject(NonNullableFormBuilder);
  protected exampleService = inject(SupabaseService);

  protected signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.required]],
    password: ['', [Validators.required]],
  });

  protected signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.required]],
    password: ['', [Validators.required]],
  });

  protected async signup(): Promise<AuthResponse> {
    const { email, password } = this.signupForm.getRawValue();
    return await this.exampleService.signup(email, password);
  }

  protected async signin(): Promise<AuthTokenResponsePassword> {
    const { email, password } = this.signinForm.getRawValue();
    return await this.exampleService.signin(email, password);
  }
}
