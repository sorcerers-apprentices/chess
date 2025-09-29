import { TestBed } from '@angular/core/testing';

import { GameViewerService } from './game-viewer.service';

describe('GameViewerService', () => {
  let service: GameViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
