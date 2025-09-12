import {
  TuiIcon,
  TuiError,
  TuiLabel,
  TuiButton,
  TuiAlertService,
  TuiTextfieldComponent,
  TuiTextfieldDirective,
  TuiTextfieldOptionsDirective,
} from '@taiga-ui/core';
import {
  Validators,
  ReactiveFormsModule,
  NonNullableFormBuilder,
} from '@angular/forms';
import {
  TuiPassword,
  TuiFieldErrorPipe,
  tuiValidationErrorsProvider,
} from '@taiga-ui/kit';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { TuiMainComponent } from '@taiga-ui/layout';
import { Header } from '../../components/header/header';
import { signInUser } from '../../store/actions/user.actions';
import { SupabaseService } from '../../services/supabase.service';
import type { User } from '@supabase/auth-js/dist/module/lib/types';
import { Navigation } from '../../components/navigation/navigation';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserSupabaseService } from '../../services/user-supabase.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
  protected readonly translate = inject(TranslateService);
  protected readonly api = inject(UserSupabaseService);
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
