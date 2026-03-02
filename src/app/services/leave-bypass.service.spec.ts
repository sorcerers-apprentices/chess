import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LeaveBypassService } from '@/app/services/leave-bypass.service';
import { PlayerTimerService } from '@/app/services/player-timer.service';
import { TestBed } from '@angular/core/testing';

type ResetFn = (explicitBase?: string) => void;

describe('LeaveBypassService', () => {
  let service: LeaveBypassService;

  let resetSpy: jest.MockedFunction<ResetFn>;
  let timerMock: Pick<PlayerTimerService, 'reset'>;

  beforeEach(() => {
    resetSpy = jest.fn();
    timerMock = {
      reset: (...args: Parameters<ResetFn>): void => resetSpy(...args),
    } satisfies Pick<PlayerTimerService, 'reset'>;

    TestBed.configureTestingModule({
      providers: [
        LeaveBypassService,
        { provide: PlayerTimerService, useValue: timerMock },
      ],
    });

    service = TestBed.inject(LeaveBypassService);
  });

  it('по умолчанию consume() → false (флаг не установлен)', () => {
    expect(service.consume()).toBe(false);
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('bypassOnce(): вызывает timer.reset() и ставит одноразовый флаг', () => {
    service.bypassOnce();

    expect(resetSpy).toHaveBeenCalledTimes(1);
    // reset вызывается без аргумента → undefined
    expect(resetSpy).toHaveBeenLastCalledWith();

    // первый consume съедает флаг → true
    expect(service.consume()).toBe(true);
    // второй — уже false
    expect(service.consume()).toBe(false);
  });

  it('многократный bypassOnce() до consume(): reset вызывается столько же раз, флаг одноразовый', () => {
    service.bypassOnce();
    service.bypassOnce();

    expect(resetSpy).toHaveBeenCalledTimes(2);
    expect(resetSpy).toHaveBeenNthCalledWith(1);

    expect(service.consume()).toBe(true);
    expect(service.consume()).toBe(false);
  });

  it('consume() сам по себе НЕ трогает timer.reset()', () => {
    expect(service.consume()).toBe(false);
    expect(resetSpy).not.toHaveBeenCalled();

    service.bypassOnce();
    expect(service.consume()).toBe(true);
    // reset вызывался только внутри bypassOnce()
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });
});
