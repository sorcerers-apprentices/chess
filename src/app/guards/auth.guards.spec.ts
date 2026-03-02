import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { Mock } from 'jest-mock';

import type {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Router } from '@angular/router';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import {
  anonymousGuardFunction,
  authenticatedGuardFunction,
  canDeactivatePopup,
} from '@/app/guards/auth.guard';
import { LOCAL_STORAGE_KEY } from '@/app/constants/auth.constants';
import type { Observable } from 'rxjs';
import { firstValueFrom, of } from 'rxjs';
import type { TuiConfirmData } from '@taiga-ui/kit';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import type { AppStateType } from '@/app/store/states/app.state';
import { Store } from '@ngrx/store';
import { selectIsGameOver } from '@/app/store/selectors/game.selectors';

function makeRoute(): ActivatedRouteSnapshot {
  return {} as ActivatedRouteSnapshot;
}

function makeState(url = '/'): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

function callCanDeactivate(nextUrl = '/'): Observable<boolean> {
  return TestBed.runInInjectionContext(
    () =>
      canDeactivatePopup(
        {} as unknown,
        makeRoute(),
        makeState('/current'),
        makeState(nextUrl),
      ) as Observable<boolean>,
  );
}

describe('auth guards (functional)', () => {
  let router: Router;
  let dialogs: TuiResponsiveDialogService;
  let translate: TranslateService;
  let envInjector: EnvironmentInjector;
  let timer: PlayerTimerService;
  let store: Store<AppStateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            parseUrl: jest.fn((url: string) => ({ url }) as unknown as UrlTree),
          },
        },
        {
          provide: TuiResponsiveDialogService,
          useValue: { open: jest.fn() },
        },
        {
          provide: TranslateService,
          useValue: { instant: jest.fn((k: string) => k) }, // вернём ключ как «перевод»
        },
        {
          provide: PlayerTimerService,
          useValue: {
            reset: jest.fn(),
            consumePendingBase: jest.fn(() => null),
          },
        },
        {
          provide: Store,
          useValue: {
            selectSignal: jest.fn((): (() => boolean) => () => false),
          },
        },
        {
          provide: LeaveBypassService,
          useValue: { consume: jest.fn(() => false) },
        },
      ],
    });

    envInjector = TestBed.inject(EnvironmentInjector);
    router = TestBed.inject(Router);
    dialogs = TestBed.inject(TuiResponsiveDialogService);
    translate = TestBed.inject(TranslateService);
    timer = TestBed.inject(PlayerTimerService);
    store = TestBed.inject(Store);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('authenticatedGuardFunction', () => {
    it('возвращает true при наличии токена', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem'); // <-- inline spy
      getItem.mockReturnValue('token');
      const result = runInInjectionContext(envInjector, () =>
        authenticatedGuardFunction(makeRoute(), makeState()),
      );
      expect(result).toBe(true);
      expect(getItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);
    });

    it('редиректит на signin при отсутствии токена', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem');
      getItem.mockReturnValue(null);
      const parseUrl = router.parseUrl as jest.Mock;

      const result = runInInjectionContext(envInjector, () =>
        authenticatedGuardFunction(makeRoute(), makeState()),
      );

      expect(parseUrl).toHaveBeenCalledWith('signin');
      expect(result).toBe(parseUrl.mock.results[0].value);
    });
  });

  describe('anonymousGuardFunction', () => {
    it('редиректит на game при наличии токена', () => {
      const getItem = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue('token');
      const parseUrl = router.parseUrl as unknown as jest.Mock;

      const result = runInInjectionContext(envInjector, () =>
        anonymousGuardFunction(makeRoute(), makeState()),
      );

      expect(getItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);
      expect(parseUrl).toHaveBeenCalledWith('game');
      expect(result).toBe(parseUrl.mock.results[0].value);
    });

    it('возвращает true при отсутствии токена', () => {
      const getItem = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(null);
      const parseUrl = router.parseUrl as unknown as jest.Mock;

      const result = runInInjectionContext(envInjector, () =>
        anonymousGuardFunction(makeRoute(), makeState()),
      );

      expect(getItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);
      expect(parseUrl).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('canDeactivatePopup', () => {
    it('открывает TUI_CONFIRM c переведёнными кнопками и возвращает boolean(true)', async () => {
      (translate.instant as Mock<(k: string) => string>).mockImplementation(
        (k) => `__${k}__`,
      );

      (dialogs.open as jest.Mock).mockReturnValue(of(true));
      (timer.consumePendingBase as jest.Mock).mockReturnValue(
        'pending_base_key',
      );

      const result = await firstValueFrom(callCanDeactivate('/somewhere'));
      expect(result).toBe(true);

      expect(dialogs.open).toHaveBeenCalledTimes(1);

      const [token, options] = (dialogs.open as jest.Mock).mock.calls[0] as [
        unknown,
        { size: string; data: TuiConfirmData },
      ];

      expect(token).toBe(TUI_CONFIRM);
      expect(options.size).toBe('s');
      expect(options.data.content).toBe('__game.notification__');
      expect(options.data.yes).toBe('__game.yes__');
      expect(options.data.no).toBe('__game.no__');

      expect(timer.consumePendingBase).toHaveBeenCalledTimes(1);
      expect(timer.reset).toHaveBeenCalledTimes(1);
      expect(timer.reset).toHaveBeenLastCalledWith('pending_base_key');
    });

    it('прокидывает false, если пользователь отменил', async () => {
      (dialogs.open as jest.Mock).mockReturnValue(of(false));

      const result = await firstValueFrom(callCanDeactivate('/somewhere'));

      expect(result).toBe(false);
      expect(timer.consumePendingBase).not.toHaveBeenCalled();
      expect(timer.reset).not.toHaveBeenCalled();
      expect(store.selectSignal as jest.Mock).toHaveBeenCalledWith(
        selectIsGameOver,
      );
    });

    it('возвращает true БЕЗ диалога, если bypass.consume() === true', async () => {
      (TestBed.inject(LeaveBypassService).consume as jest.Mock).mockReturnValue(
        true,
      );

      const result = await firstValueFrom(callCanDeactivate('/somewhere'));

      expect(result).toBe(true);
      expect(dialogs.open as jest.Mock).not.toHaveBeenCalled();
      expect(timer.reset as jest.Mock).not.toHaveBeenCalled();
    });

    it('если игра окончена — вызывает timer.reset() и возвращает true БЕЗ диалога', async () => {
      (store.selectSignal as jest.Mock).mockReturnValue(() => true);

      const result = await firstValueFrom(callCanDeactivate('/somewhere'));

      expect(result).toBe(true);
      expect(dialogs.open as jest.Mock).not.toHaveBeenCalled();
      expect(timer.reset as jest.Mock).toHaveBeenCalledTimes(1);
      expect(timer.reset as jest.Mock).toHaveBeenLastCalledWith();
    });

    it('если переход на engine-log — возвращает true без диалога', async () => {
      const result = await firstValueFrom(callCanDeactivate('/engine-log'));

      expect(result).toBe(true);
      expect(dialogs.open as jest.Mock).not.toHaveBeenCalled();
    });
  });
});
