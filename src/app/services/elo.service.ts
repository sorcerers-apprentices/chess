import {
  selectElo,
  selectGamesPlayed,
} from '@/app/store/selectors/user.selectors';
import {
  updateElo,
  incrementGamesPlayed,
} from '@/app/store/actions/user.actions';
import {
  INITIAL_ELO,
  PRO_K_FACTOR,
  INITIAL_K_FACTOR,
  DEFAULT_K_FACTOR,
} from '@/app/constants/elo.constants';
import { Store } from '@ngrx/store';
import { inject, Injectable } from '@angular/core';

type EloResult = {
  oldRating: number;
  newRating: number;
  delta: number;
  k: number;
};

@Injectable({
  providedIn: 'any',
})
export class EloService {
  private readonly store = inject(Store);
  private readonly elo = this.store.selectSignal(selectElo);
  private readonly gamesPlayed = this.store.selectSignal(selectGamesPlayed);

  public win(): EloResult {
    return this.applyChange('win');
  }

  public draw(): EloResult {
    return this.applyChange('draw');
  }

  public loss(): EloResult {
    return this.applyChange('loss');
  }

  private applyChange(kind: 'win' | 'draw' | 'loss'): EloResult {
    const currentRating = Math.max(0, Math.round(this.elo() ?? INITIAL_ELO));
    const played = Math.max(0, Math.floor(this.gamesPlayed() ?? 0));

    const k = this.getKFactor(currentRating, played);

    let delta = 0;
    if (kind === 'win') delta = k;
    if (kind === 'loss') delta = -k;

    let newRating = currentRating + delta;
    if (newRating < 0) newRating = 0;

    this.store.dispatch(updateElo({ elo: newRating }));
    this.store.dispatch(incrementGamesPlayed({ by: 1 }));

    return {
      oldRating: currentRating,
      newRating,
      delta: newRating - currentRating,
      k,
    };
  }

  private getKFactor(rating: number, gamesPlayed: number): number {
    if (rating >= 2400) return PRO_K_FACTOR;
    if (gamesPlayed < 30) return INITIAL_K_FACTOR;
    return DEFAULT_K_FACTOR;
  }
}
