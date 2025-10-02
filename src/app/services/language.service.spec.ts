import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import {
  LANGUAGE_KEY,
  LANGUAGE_TOKEN,
  LanguageService,
} from '@/app/services/language.service';

type Lang = 'en' | 'ru';
type TranslateUseOnly = Pick<TranslateService, 'use'>;

async function flushMicrotasks(times = 1): Promise<void> {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

function mockLocalStorage(getValue: string | null): {
  getItemSpy: ReturnType<typeof jest.spyOn>;
  setItemSpy: ReturnType<typeof jest.spyOn>;
} {
  const getItemSpy = jest
    .spyOn(Storage.prototype, 'getItem')
    .mockImplementation((key: string) =>
      key === LANGUAGE_KEY ? getValue : null,
    );

  const setItemSpy = jest
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(() => {});

  return { getItemSpy, setItemSpy };
}

describe('LanguageService', () => {
  let translate: { use: jest.MockedFunction<TranslateUseOnly['use']> };
  let langSignal: WritableSignal<Lang>;

  beforeEach(() => {
    jest.restoreAllMocks();

    langSignal = signal<Lang>('en');

    const translateMock: TranslateUseOnly = {
      use: jest.fn(() => EMPTY) as unknown as TranslateUseOnly['use'],
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: LANGUAGE_TOKEN, useValue: langSignal },
        {
          provide: TranslateService,
          useValue: translateMock as unknown as TranslateService,
        },
      ],
    });

    translate = TestBed.inject(TranslateService) as unknown as {
      use: jest.MockedFunction<TranslateUseOnly['use']>;
    };
  });

  it('инициализируется из localStorage = "ru" и вызывает translate.use("ru")', async () => {
    const { getItemSpy, setItemSpy } = mockLocalStorage('ru');

    const service = TestBed.inject(LanguageService);
    await flushMicrotasks(); // даём effect выполниться

    expect(getItemSpy).toHaveBeenCalledWith(LANGUAGE_KEY);
    expect(translate.use).toHaveBeenLastCalledWith('ru');
    expect(setItemSpy).toHaveBeenLastCalledWith(LANGUAGE_KEY, 'ru');
    expect(service.language()).toBe('ru');
  });

  it('если localStorage пуст — дефолт "en"', async () => {
    const { getItemSpy, setItemSpy } = mockLocalStorage(null);

    const service = TestBed.inject(LanguageService);
    await flushMicrotasks(); // первый прогон эффекта

    expect(getItemSpy).toHaveBeenCalledWith(LANGUAGE_KEY);
    expect(translate.use).toHaveBeenLastCalledWith('en');
    expect(setItemSpy).toHaveBeenLastCalledWith(LANGUAGE_KEY, 'en');
    expect(service.language()).toBe('en');
  });

  it('реагирует на смену языка через signal.set()', async () => {
    mockLocalStorage(null);

    const service = TestBed.inject(LanguageService);
    await flushMicrotasks(); // эффект на старте (en)
    translate.use.mockClear();

    const setItemSpy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {});

    service.language.set('ru');
    await flushMicrotasks(); // эффект после set('ru')

    expect(translate.use).toHaveBeenCalledTimes(1);
    expect(translate.use).toHaveBeenCalledWith('ru');
    expect(setItemSpy).toHaveBeenCalledWith(LANGUAGE_KEY, 'ru');
    expect(service.language()).toBe('ru');
  });
});
