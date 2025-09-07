import type { AuthTokenResponsePassword } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Header } from '../../components/header/header';
import { Navigation } from '../../components/navigation/navigation';
import {
  TuiButton,
  TuiIcon,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import { TuiMainComponent } from '@taiga-ui/layout';
import { TuiPassword } from '@taiga-ui/kit';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    Header,
    Navigation,
    TuiButton,
    TuiIcon,
    TuiLabel,
    TuiMainComponent,
    TuiPassword,
    TuiTextfieldComponent,
    TuiTextfieldOptionsDirective,
    TuiTextfieldDirective,
  ],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  protected fb = inject(NonNullableFormBuilder);
  protected exampleService = inject(SupabaseService);

  protected signinForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  protected async signin(): Promise<AuthTokenResponsePassword> {
    const { email, password } = this.signinForm.getRawValue();
    return await this.exampleService.signin(email, password);
  }
}
