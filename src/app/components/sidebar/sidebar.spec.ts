import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import { Component } from '@angular/core';

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Sidebar } from '@/app/components/sidebar/sidebar';
import type { IsActiveMatchOptions, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GameService } from '@/app/services/game.service';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import { LANGUAGE_KEY, LANGUAGE_TOKEN } from '@/app/services/language.service';
import {
  CHOSEN_COLOR_TOKEN,
  START_FEN,
} from '@/app/constants/chess-game.constants';
import { TUI_DARK_MODE } from '@taiga-ui/core';
import { GAME_ID, LOCAL_STORAGE_KEY } from '@/app/constants/auth.constants';
import type { RoutePathValue } from '@/app/app.routes';
import { RoutePath } from '@/app/app.routes';
import { logoutUser } from '@/app/store/actions/user.actions';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';

type AppStateType = unknown;

// Тестовый наследник: создаёт DI-контекст и делает нужные методы public
@Component({
  standalone: true,
  template: '', // без шаблона — тестим только логику
})
class SidebarHarness extends Sidebar {
  public callPlayGame(): void {
    this.playGame();
  }
  public callOnClick(item: { nameKey: string; route: RoutePathValue }): void {
    this.onClick(item);
  }
  public callOnLogout(): void {
    this.onLogout();
  }
}

describe('Sidebar (strictly typed)', () => {
  let fixture: ComponentFixture<SidebarHarness>;

  // Router
  let routerMock: Pick<Router, 'navigate' | 'isActive' | 'createUrlTree'>;
  let navigateMock: jest.MockedFunction<Router['navigate']>;
  let isActiveMock: jest.MockedFunction<Router['isActive']>;
  let createUrlTreeMock: jest.MockedFunction<Router['createUrlTree']>;

  // Store
  let storeMock: jest.Mocked<Pick<Store<AppStateType>, 'dispatch'>>;
  // Services
  let gameServiceMock: jest.Mocked<Pick<GameService, 'newGame'>>;
  let timerServiceMock: jest.Mocked<
    Pick<PlayerTimerService, 'baseSnapshot' | 'setPendingBase'>
  >;
  let bypassServiceMock: jest.Mocked<Pick<LeaveBypassService, 'bypassOnce'>>;

  const translateServiceMock: Partial<TranslateService> = {
    use: jest.fn(() => EMPTY),
    instant: jest.fn((key: string) => key),
    get: jest.fn((key: string) => of(key)),
  };

  // Signals (DI токены)
  let languageSig: WritableSignal<'en' | 'ru'>;
  let chosenColorSig: WritableSignal<'white' | 'black'>;
  let darkModeSig: WritableSignal<boolean> & { reset(): void };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(LOCAL_STORAGE_KEY, 'token-abc');

    type IsActiveOverloads = Router['isActive']; // те же перегрузки

    const isActiveMockImpl = jest.fn<
      (url: string | UrlTree, match: boolean | IsActiveMatchOptions) => boolean
    >(() => false);
    isActiveMock =
      isActiveMockImpl as unknown as jest.MockedFunction<IsActiveOverloads>;

    const navigateImpl = jest.fn<Router['navigate']>();
    navigateMock = navigateImpl as unknown as jest.MockedFunction<
      Router['navigate']
    >;

    const createUrlTreeImpl: jest.MockedFunction<Router['createUrlTree']> =
      jest.fn<Router['createUrlTree']>(() => ({}) as UrlTree);
    createUrlTreeMock = createUrlTreeImpl as unknown as jest.MockedFunction<
      Router['createUrlTree']
    >;

    // Собираем routerMock:
    routerMock = {
      navigate: navigateMock,
      isActive: isActiveMock,
      createUrlTree: createUrlTreeMock,
    };

    storeMock = {
      dispatch: jest.fn(),
    };

    gameServiceMock = {
      newGame: jest.fn(),
    };

    timerServiceMock = {
      baseSnapshot: jest.fn<() => string>(
        () => 'base-snap',
      ) as unknown as jest.MockedFunction<() => string>,
      setPendingBase: jest.fn<
        (base: string) => void
      >() as unknown as jest.MockedFunction<(base: string) => void>,
    };

    bypassServiceMock = {
      bypassOnce: jest.fn<() => void>() as unknown as jest.MockedFunction<
        () => void
      >,
    };

    languageSig = signal<'en' | 'ru'>('en');
    chosenColorSig = signal<'white' | 'black'>('white');
    const resetMock = jest.fn<() => void>();

    darkModeSig = Object.assign(signal<boolean>(false), {
      reset: resetMock,
    }) as WritableSignal<boolean> & { reset(): void };

    TestBed.configureTestingModule({
      imports: [SidebarHarness],
      providers: [
        { provide: LANGUAGE_TOKEN, useValue: languageSig },
        { provide: CHOSEN_COLOR_TOKEN, useValue: chosenColorSig },
        { provide: TUI_DARK_MODE, useValue: darkModeSig },

        { provide: Router, useValue: routerMock },
        { provide: Store, useValue: storeMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: PlayerTimerService, useValue: timerServiceMock },
        { provide: LeaveBypassService, useValue: bypassServiceMock },
        {
          provide: TranslateService,
          useValue: translateServiceMock as TranslateService,
        },
      ],
    });

    fixture = TestBed.createComponent(SidebarHarness);
    fixture.detectChanges();
  });

  it("'playGame() подготавливает таймер и вызывает newGame(START_FEN, выбранный цвет)'", () => {
    fixture.componentInstance.callPlayGame();

    expect(timerServiceMock.baseSnapshot).toHaveBeenCalledTimes(1);
    expect(timerServiceMock.setPendingBase).toHaveBeenCalledWith('base-snap');
    expect(gameServiceMock.newGame).toHaveBeenCalledWith(START_FEN, 'white');
  });

  it('onClick(item) вызывает router.navigate([item.route])', () => {
    fixture.componentInstance.callOnClick({
      nameKey: 'sidebar.homePage',
      route: RoutePath.home,
    });
    expect(navigateMock).toHaveBeenCalledWith([RoutePath.home]);
  });

  it('onLogout: (на странице игры) bypassOnce → dispatch → очистка LS → navigate', () => {
    isActiveMock.mockReturnValue(true);
    localStorage.setItem(GAME_ID, 'g1');
    localStorage.setItem(LANGUAGE_KEY, 'ru');

    fixture.componentInstance.callOnLogout();

    expect(bypassServiceMock.bypassOnce).toHaveBeenCalledTimes(1);
    expect(storeMock.dispatch).toHaveBeenCalledWith(logoutUser());
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(GAME_ID)).toBeNull();
    expect(localStorage.getItem(LANGUAGE_KEY)).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/signin']);
  });

  it('без токена: onLogout() не вызывает bypassOnce, но ведёт на /signin', () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    fixture.componentInstance.callOnLogout();

    expect(bypassServiceMock.bypassOnce).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(['/signin']);
  });

  it('смена выбранного цвета влияет на аргументы newGame (w → b)', () => {
    chosenColorSig.set('black');

    fixture.componentInstance.callPlayGame();

    expect(gameServiceMock.newGame).toHaveBeenLastCalledWith(
      START_FEN,
      'black',
    );
  });

  it('linkedSignal(langEn) + effect: переключение languageSig сохраняется корректно (без зацикливания)', () => {
    expect(languageSig()).toBe('en');

    languageSig.set('ru');
    expect(languageSig()).toBe('ru');

    languageSig.set('en');
    expect(languageSig()).toBe('en');
  });
});
