import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_KEY } from '../constants/auth.constants';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { selectIsGameOver } from '@/app/store/selectors/game.selectors';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';

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
  const bypass = inject(LeaveBypassService);
  if (bypass.consume()) {
    // “Новая игра/Домой” инициированы из приложения → не спрашиваем
    return of(true);
  }

  const store = inject<Store<AppStateType>>(Store);
  const isGameOver = store.selectSignal(selectIsGameOver);

  if (isGameOver()) {
    // Игра уже закончена → уходим без подтверждения
    return of(true);
  }

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
