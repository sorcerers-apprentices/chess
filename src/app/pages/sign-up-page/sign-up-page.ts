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
  TuiFieldErrorPipe,
  tuiInputPhoneInternationalOptionsProvider,
  TuiInputRange,
  TuiPassword,
  tuiValidationErrorsProvider,
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
import { SupabaseService } from '../../services/supabase.service';
import { TuiInputPhoneModule } from '@taiga-ui/legacy';
import metadata from 'libphonenumber-js/mobile/metadata';
import { firstValueFrom, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  maxPasswordLength,
  minPasswordLength,
} from '../../constants/constants';
import {
  noLowerCaseLetters,
  noNumbers,
  noUpperCaseLetters,
  noValidEmailFormat,
  noWhitespace,
} from '../../utilities/validation-funtions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
    tuiValidationErrorsProvider({
      required: 'This field is required',
      minlength: ({ requiredLength }: { requiredLength: string }) =>
        of(`Minimum length — ${requiredLength}`),
      maxlength: ({ requiredLength }: { requiredLength: string }) =>
        `Maximum length — ${requiredLength}`,
    }),
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SignUpPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly api = inject(SupabaseService);
  protected readonly alert = inject(TuiAlertService);
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

  protected signupForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, noWhitespace(), noValidEmailFormat()],
    }),
    phone: this.fb.control('', {
      validators: [Validators.required],
    }),
    username: this.fb.control('', {
      validators: [Validators.required],
    }),
    password: this.fb.control('', {
      validators: [
        Validators.required,
        noWhitespace(),
        Validators.minLength(minPasswordLength),
        Validators.maxLength(maxPasswordLength),
        noUpperCaseLetters(),
        noLowerCaseLetters(),
        noNumbers(),
      ],
    }),
  });

  protected async signup(): Promise<void> {
    const result = await this.api.signup(this.signupForm.getRawValue());

    if (result.error) {
      return await firstValueFrom(
        this.alert.open('<strong>ERROR</strong>', {
          label: result.error.message
            ? `${result.error.message}!`
            : this.translate.instant('signup.errorFallback'),
          appearance: 'negative',
        }),
      );
    }
    this.successSignUp.update((prev) => !prev);
  }
}
