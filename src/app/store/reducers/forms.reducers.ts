import {
  writeLogin,
  writePassword,
  submitLoginForm,
} from '@/app/store/actions/forms.actions';
import { createReducer, on } from '@ngrx/store';
import { initialFormsState } from '@/app/store/states/forms.state';
import type { FormsStateType } from '@/app/store/states/forms.state';

export const formsReducers = createReducer(
  initialFormsState,

  on(
    writeLogin,
    (state, action): FormsStateType => ({
      ...state,
      login: action.login,
    }),
  ),
  on(
    writePassword,
    (state, action): FormsStateType => ({
      ...state,
      password: action.password,
    }),
  ),
  on(
    submitLoginForm,
    (state): FormsStateType => ({
      ...state,
      password: '',
      login: '',
    }),
  ),
);
