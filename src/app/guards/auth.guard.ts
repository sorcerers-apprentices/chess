import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_KEY } from '../constants/auth.constants';
import type { Observable } from 'rxjs';
import { map, take } from 'rxjs';
import { tap } from 'rxjs';
import { of } from 'rxjs';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { selectIsGameOver } from '@/app/store/selectors/game.selectors';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import { PlayerTimerService } from '@/app/services/player-timer.service';

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
    console.log('[GUARD] bypass.consume() → true');
    return of(true);
  }

  const store = inject<Store<AppStateType>>(Store);
  const isGameOver = store.selectSignal(selectIsGameOver);

  const timer = inject(PlayerTimerService);

  // Если игра реально закончена — уходим БЕЗ модалки, но чистим таймер
  if (isGameOver()) {
    console.log('[GUARD] isGameOver → true (cleanup + skip dialog)');
    timer.reset(); // ← ТОЛЬКО reset, БЕЗ bypassOnce()
    return of(true);
  }

  const translateService = inject(TranslateService);
  const dialogs = inject(TuiResponsiveDialogService);
  const data: TuiConfirmData = {
    content: translateService.instant('game.notification'),
    yes: translateService.instant('game.yes'),
    no: translateService.instant('game.no'),
  };

  console.log('[GUARD] opening confirm dialog');

  return dialogs.open<boolean>(TUI_CONFIRM, { size: 's', data }).pipe(
    tap((confirm) => {
      console.log('[GUARD] confirm result =', confirm);
      if (confirm) {
        // ЕДИНОЕ МЕСТО: готовим «чистый» выход (и сброс таймера внутри)
        timer.reset();
      }
    }),
    map(Boolean),
    take(1),
  );
};
