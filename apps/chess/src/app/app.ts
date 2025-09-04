import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { SupabaseService } from './shared/services/supabase.service';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  imports: [RouterModule, TuiRoot, ReactiveFormsModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private fb = inject(NonNullableFormBuilder);
  protected exampleService = inject(SupabaseService);

  protected signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async signup() {
    const { email, password } = this.signupForm.getRawValue();
    return await this.exampleService.signup(email, password);
  }

  async signin() {
    const { email, password } = this.signinForm.getRawValue();
    return await this.exampleService.signin(email, password);
  }
}
