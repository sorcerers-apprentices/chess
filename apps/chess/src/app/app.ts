import {
  Validators,
  ReactiveFormsModule,
  NonNullableFormBuilder,
} from '@angular/forms';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js';
import { TuiRoot } from '@taiga-ui/core';
import { RouterModule } from '@angular/router';
import { Component, inject } from '@angular/core';
import { SupabaseService } from './services/supabase.service';

@Component({
  imports: [RouterModule, TuiRoot, ReactiveFormsModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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
