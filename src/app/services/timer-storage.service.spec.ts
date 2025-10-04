import { TestBed } from '@angular/core/testing';

import { TimerStorageService } from './timer-storage.service';

describe('TimerStorageService', () => {
  let service: TimerStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
