import { TestBed } from '@angular/core/testing';

import { EloService } from './elo.service';
import { Store } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import { computed, signal, type WritableSignal } from '@angular/core';
import type { UserStateType } from '@/app/store/states/user.state';
import type { GameStateType } from '@/app/store/states/game.state';
import type { FormsStateType } from '@/app/store/states/forms.state';

describe('EloService', () => {
  let service: EloService;
  let store: Store<AppStateType>;
  let storeState: WritableSignal<AppStateType> = signal({
    user: {
      elo: 1200,
      gamesPlayed: 1,
    } as UserStateType,
    game: {} as GameStateType,
    forms: {} as FormsStateType,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store<AppStateType>,
          useValue: {
            selectSignal: jest.fn(<K>(selector: (store: AppStateType) => K) =>
              computed(() => selector(storeState())),
            ),
            dispatch: jest.fn(() => {}),
          },
        },
      ],
    });
    service = TestBed.inject(EloService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(store.selectSignal).toHaveBeenCalledTimes(2);
  });

  it('should init elo', () => {
    service.win();

    expect(store.dispatch).toHaveBeenCalledWith({
      elo: 1240,
      type: '[User] Update Elo',
    });
  });

  it('should correctly calculate Elo on loss', () => {
    service.loss();

    expect(store.dispatch).toHaveBeenCalledWith({
      elo: 1160,
      type: '[User] Update Elo',
    });
  });

  it('should correctly calculate Elo on draw', () => {
    service.draw();

    expect(store.dispatch).toHaveBeenCalledWith({
      elo: 1200,
      type: '[User] Update Elo',
    });
  });

  it('should dispatch updateElo with DEFAULT_K_FACTOR after 30 games', () => {
    const oldState = storeState();
    storeState.set({
      user: {
        elo: 1500,
        gamesPlayed: 31,
      } as UserStateType,
      game: {} as GameStateType,
      forms: {} as FormsStateType,
    });

    service.win();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: '[User] Update Elo',
      elo: 1520,
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: '[User] Increment Games Played',
      by: 1,
    });

    storeState.set(oldState);
  });
});
