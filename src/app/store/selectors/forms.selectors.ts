import { createSelector } from '@ngrx/store';
import type { FormsStateType } from '@/app/store/states/forms.state';

const selectForms = (state: FormsStateType): FormsStateType => state;

export const selectLogin = createSelector(
  selectForms,
  (state: FormsStateType) => state.login,
);

export const selectPassword = createSelector(
  selectForms,
  (state: FormsStateType) => state.password,
);
