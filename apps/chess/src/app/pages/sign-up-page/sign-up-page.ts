import { Header } from '../../components/header/header';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiNavigation } from '@taiga-ui/layout';
import { Navigation } from '../../components/navigation/navigation';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TuiInputRange, TuiPassword } from '@taiga-ui/kit';
import {
  TuiButton,
  TuiIcon,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import { SupabaseService } from '../../services/supabase.service';
import type { AuthResponse } from '@supabase/supabase-js';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiNavigation,
    Navigation,
    ReactiveFormsModule,
    TuiInputRange,
    TuiTextfieldComponent,
    TuiTextfieldOptionsDirective,
    TuiTextfieldDirective,
    TuiButton,
    TuiPassword,
    TuiIcon,
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  protected fb = inject(NonNullableFormBuilder);
  protected supabaseService = inject(SupabaseService);

  protected signupForm = this.fb.group({
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    username: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  protected async signup(): Promise<AuthResponse> {
    const { password, email, username } = this.signupForm.getRawValue();
    return await this.supabaseService.signup(email, password, username);
  }
}
