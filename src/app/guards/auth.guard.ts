import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_KEY } from '../constants/auth.constants';
import type { Observable } from 'rxjs';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TranslateService } from '@ngx-translate/core';

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
  const translateService = inject(TranslateService);
  const dialogs = inject(TuiResponsiveDialogService);
  const data: TuiConfirmData = {
    content: translateService.instant('game.notification'),
    yes: translateService.instant('game.yes'),
    no: translateService.instant('game.no'),
  };

  return dialogs.open<boolean>(TUI_CONFIRM, {
    size: 's',
    data,
  });
};
