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
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TUI_VALIDATION_ERRORS,
  TuiFieldErrorPipe,
  TuiPassword,
} from '@taiga-ui/kit';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { TuiMainComponent } from '@taiga-ui/layout';
import { Header } from '../../components/header/header';
import { signInUser } from '../../store/actions/user.actions';
import type { User } from '@supabase/auth-js/dist/module/lib/types';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserSupabaseService } from '../../services/user-supabase.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  noValidEmailFormat,
  noWhitespace,
} from '@/app/utilities/validation-funtions';

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
    TranslatePipe,
  ],
  providers: [
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
        };
      },
      deps: [TranslateService],
    },
  ],
  standalone: true,
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  protected readonly fb = inject(NonNullableFormBuilder);
  protected readonly translate = inject(TranslateService);
  protected readonly api = inject(UserSupabaseService);
  protected readonly alert = inject(TuiAlertService);
  protected readonly store = inject(Store);
  protected readonly router = inject(Router);

  protected signinForm = this.fb.group({
    email: this.fb.control('', {
      validators: [Validators.required, noWhitespace(), noValidEmailFormat()],
    }),
    password: this.fb.control('', {
      validators: [Validators.required],
    }),
  });

  protected async signin(): Promise<void> {
    this.signinForm.markAllAsTouched();
    if (this.signinForm.invalid) {
      return;
    }
    const result = await this.api.signin(this.signinForm.getRawValue());

    if (result.error) {
      return await firstValueFrom(
        this.alert.open('<strong>ERROR</strong>', {
          label: result.error.message
            ? `${result.error.message}!`
            : this.translate.instant('signin.errorFallback'),
          appearance: 'negative',
        }),
      );
    }

    const user: User = result.data.user;
    const playedGames = await this.api.fetchGamesCount(user.id);
    const winedGames = await this.api.fetchWinedGamesCount(user.id);

    const signInUserAction = signInUser({
      user: {
        email: user.email ?? '',
        username: user.user_metadata['username'],
        phone: user.user_metadata['phone'],
        playedGames,
        winedGames,
      },
    });
    this.store.dispatch(signInUserAction);

    return this.router.navigate(['/game']).then();
  }

  protected goToSignUpPage(): void {
    this.router.navigate(['/signup']).then();
  }
}
