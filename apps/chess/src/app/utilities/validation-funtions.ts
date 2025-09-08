import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function noWhitespace(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const hasWhitespace = /\s/.test(value);
    return hasWhitespace ? { whitespace: 'No whitespace allowed' } : null;
  };
}

export function noUpperCaseLetters(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noUpperCaseLetters = !/[A-Z]/.test(value);
    return noUpperCaseLetters
      ? { noUpperCaseLetters: 'Field should include uppercase letters' }
      : null;
  };
}

export function noLowerCaseLetters(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noLowerCaseLetters = !/[a-z]/.test(value);
    return noLowerCaseLetters
      ? { noLowerCaseLetters: 'Field should include lowercase letters' }
      : null;
  };
}

export function noNumbers(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noNumbers = !/[0-9]/.test(value);
    return noNumbers ? { noNumbers: 'Field should include numbers' } : null;
  };
}

export function noValidEmailFormat(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string | null = control.value;
    if (value === null) {
      return null;
    }
    const noSymbol = !value.includes('@');
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const noPropperFormat = !regex.test(value);
    return noSymbol
      ? { noSymbol: 'Email should include @' }
      : noPropperFormat
        ? {
            noPropperFormat:
              "Invalid email format, proper format is 'user@example.com'",
          }
        : null;
  };
}
