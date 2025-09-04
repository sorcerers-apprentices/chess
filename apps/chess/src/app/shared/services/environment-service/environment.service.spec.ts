import { TestBed } from '@angular/core/testing';

import { EnvironmentServiceService } from './environment.service';

describe('EnvironmentServiceService', () => {
  let service: EnvironmentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
