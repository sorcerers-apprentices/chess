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
  TuiAlertService,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiLabel,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import { TuiMainComponent } from '@taiga-ui/layout';
import {
  TuiFieldErrorPipe,
  TuiPassword,
  tuiValidationErrorsProvider,
} from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { signInUser } from '../../store/actions/user.actions';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in-page',
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
    AsyncPipe,
    TuiFieldErrorPipe,
    TuiError,
  ],
  providers: [
    tuiValidationErrorsProvider({
      required: 'This field is required',
      email: 'Enter a valid email address',
    }),
  ],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly api = inject(SupabaseService);
  protected readonly alert = inject(TuiAlertService);
  protected readonly store = inject(Store);
  protected readonly router = inject(Router);

  protected signinForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  protected async signin(): Promise<void> {
    const result = await this.api.signin(this.signinForm.getRawValue());

    if (result.error) {
      return await firstValueFrom(
        this.alert.open('<strong>ERROR</strong>', {
          label: result.error.message
            ? `${result.error.message}!`
            : 'Something went wrong, try again, please',
          appearance: 'negative',
        }),
      );
    }

    const signInUserAction = signInUser({
      user: {
        email: result.data.user?.email ?? '',
        username: result.data.user?.user_metadata['username'],
        phone: result.data.user?.user_metadata['phone'],
      },
    });
    this.store.dispatch(signInUserAction);

    return this.router.navigate(['/game']).then();
  }

  protected goToSignUpPage(): void {
    this.router.navigate(['/signup']).then();
  }
}
