import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_KEY } from '../constants/auth.constants';
import type { Observable } from 'rxjs';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';

export const authenticatedGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);
  return token !== null ? true : router.parseUrl('signin');
};

export const anonymousGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  return token !== null ? router.parseUrl('game') : true;
};

export const canDeactivatePopup = (): Observable<boolean> => {
  const dialogs = inject(TuiResponsiveDialogService);
  const data: TuiConfirmData = {
    content: 'Are you sure you want to leave your game?',
    yes: 'Yes',
    no: 'No',
  };

  return dialogs.open<boolean>(TUI_CONFIRM, {
    size: 's',
    data,
  });
};
