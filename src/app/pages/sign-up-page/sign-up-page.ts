import { Header } from '../../components/header/header';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TuiBlockStatusComponent, TuiNavigation } from '@taiga-ui/layout';
import { type TuiCountryIsoCode } from '@taiga-ui/i18n';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TUI_VALIDATION_ERRORS,
  TuiFieldErrorPipe,
  tuiInputPhoneInternationalOptionsProvider,
  TuiInputRange,
  TuiPassword,
} from '@taiga-ui/kit';
import {
  TuiAlertService,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiTextfield,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import { TuiInputPhoneInternational } from '@taiga-ui/experimental';
import { TuiInputPhoneModule } from '@taiga-ui/legacy';
import metadata from 'libphonenumber-js/mobile/metadata';
import { AsyncPipe } from '@angular/common';
import {
  maxPasswordLength,
  maxUserNameLength,
  minPasswordLength,
  minUserNameLength,
  USERNAME_RE,
} from '../../constants/validation.constants';
import {
  createSamePasswordValidator,
  lowerCasePresent,
  noValidEmailFormat,
  noWhitespace,
  numbersPresent,
  uniqueUsernameValidator,
  upperCasePresent,
} from '../../utilities/validation-funtions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@/app/services/supabase/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserSupabaseService } from '@/app/services/supabase/user-supabase.service';

@Component({
  selector: 'app-game-page',
  imports: [
    Header,
    TuiInputPhoneInternational,
    TuiNavigation,
    ReactiveFormsModule,
    TuiInputRange,
    TuiTextfield,
    TuiTextfieldComponent,
    TuiTextfieldOptionsDirective,
    TuiTextfieldDirective,
    TuiButton,
    TuiPassword,
    TuiIcon,
    TuiInputPhoneModule,
    FormsModule,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiBlockStatusComponent,
    TranslatePipe,
  ],
  providers: [
    tuiInputPhoneInternationalOptionsProvider({ metadata: of(metadata) }),
    {
      provide: TUI_VALIDATION_ERRORS,
      useFactory: (translate: TranslateService): unknown => {
        translate.stream('validationErrors.required');
        return {
          required: translate.get('validationErrors.required'),
          minlength: ({ requiredLength }: { requiredLength: string }) =>
            translate.instant('validationErrors.minlength') +
            `${requiredLength}`,
          maxlength: ({ requiredLength }: { requiredLength: string }) =>
            translate.instant('validationErrors.maxlength') +
            `${requiredLength}`,
          pattern: () => translate.get('validationErrors.patternUsername'),
          noUniqueUserName: translate.get('validationErrors.noUniqueUserName'),
        };
      },
      deps: [TranslateService],
    },
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SignUpPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly alert = inject(TuiAlertService);
  protected readonly api = inject(UserSupabaseService);
  protected successSignUp = signal<boolean>(false);
  protected readonly translate = inject(TranslateService);

  protected readonly countries: readonly TuiCountryIsoCode[] = [
    'US',
    'PL',
    'BY',
    'ES',
    'FR',
    'DE',
    'IT',
    'RU',
    'GB',
    'UA',
  ];
  protected countryIsoCode: TuiCountryIsoCode = 'ES';
  protected readonly router = inject(Router);

  protected signupForm = this.fb.group(
    {
      email: this.fb.control('', {
        validators: [Validators.required, noWhitespace(), noValidEmailFormat()],
      }),
      phone: this.fb.control('', {
        validators: [Validators.required],
      }),
      displayName: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.pattern(USERNAME_RE),
          Validators.minLength(minUserNameLength),
          Validators.maxLength(maxUserNameLength),
        ],
        asyncValidators: [uniqueUsernameValidator()],
        updateOn: 'blur',
      }),
      password: this.fb.control('', {
        validators: [
          Validators.required,
          noWhitespace(),
          Validators.minLength(minPasswordLength),
          Validators.maxLength(maxPasswordLength),
          upperCasePresent(),
          lowerCasePresent(),
          numbersPresent(),
        ],
      }),
      confirmPassword: this.fb.control(''),
    },
    {
      validators: [createSamePasswordValidator()],
    },
  );

  protected async signup(): Promise<void> {
    this.signupForm.markAllAsTouched();
    this.signupForm.updateValueAndValidity();

    if (this.signupForm.pending || this.signupForm.invalid) {
      return;
    }

    const displayNameControl = this.signupForm.controls.displayName;
    const displayName = (displayNameControl.value ?? '').trim();

    const exists = await this.api.fetchUsernameExists(displayName);
    if (exists) {
      displayNameControl.setErrors({
        ...displayNameControl.errors,
        noUniqueUserName: true,
      });
      displayNameControl.markAsTouched();
      return;
    }

    try {
      const result = await this.auth.signup({
        ...this.signupForm.getRawValue(),
        displayName,
      });
      console.log(result);

      if (result.error) {
        if (
          result.error.code === 'unexpected_failure' ||
          result.error.message?.includes('Database error saving new user')
        ) {
          displayNameControl.setErrors({
            ...displayNameControl.errors,
            noUniqueUserName: true,
          });
          displayNameControl.markAsTouched();
          return;
        }

        this.signupForm.setErrors({ signupFailed: true });
        return;
      }

      this.successSignUp.set(true);
    } catch {
      this.signupForm.setErrors({ signupFailed: true });
    }
  }

  protected goToSignInPage(): void {
    this.router.navigate(['/signin']).then();
  }
}
