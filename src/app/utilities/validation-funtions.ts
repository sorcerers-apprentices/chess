import type {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';
import { UserSupabaseService } from '@/app/services/user-supabase.service';

export function noWhitespace(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const hasWhitespace = /\s/.test(value);
    return hasWhitespace
      ? { whitespace: translateService.instant('validationErrors.whitespace') }
      : null;
  };
}

export function upperCasePresent(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noUpperCaseLetters = !/[A-Z]/.test(value);
    return noUpperCaseLetters
      ? {
          noUpperCaseLetters: translateService.instant(
            'validationErrors.noUpperCaseLetters',
          ),
        }
      : null;
  };
}

export function lowerCasePresent(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noLowerCaseLetters = !/[a-z]/.test(value);
    return noLowerCaseLetters
      ? {
          noLowerCaseLetters: translateService.instant(
            'validationErrors.noLowerCaseLetters',
          ),
        }
      : null;
  };
}

export function numbersPresent(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noNumbers = !/[0-9]/.test(value);
    return noNumbers
      ? { noNumbers: translateService.instant('validationErrors.noNumbers') }
      : null;
  };
}

export function noValidEmailFormat(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noSymbol = !value.includes('@');
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const noPropperFormat = !regex.test(value);
    return noSymbol
      ? { noSymbol: translateService.instant('validationErrors.noSymbol') }
      : noPropperFormat
        ? {
            noPropperFormat: translateService.instant(
              'validationErrors.noPropperFormat',
            ),
          }
        : null;
  };
}

export function createSamePasswordValidator(): ValidatorFn {
  const translateService = inject(TranslateService);
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value === confirmPassword?.value) {
      confirmPassword?.setErrors(null);
      return null;
    } else {
      confirmPassword?.setErrors({
        passwordMismatch: translateService.instant(
          'validationErrors.samePasswordValidator',
        ),
      });
      return {
        passwordMismatch: translateService.instant(
          'validationErrors.samePasswordValidator',
        ),
      };
    }
  };
}

export function uniqueUsernameValidator(): AsyncValidatorFn {
  const translateService = inject(TranslateService);
  const api = inject(UserSupabaseService);
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const response = await api.fetchUsernameExists(control.value);
    return response
      ? {
          noUniqueUserName: translateService.instant(
            'validationErrors.noUniqueUserName',
          ),
        }
      : null;
  };
}
