import { createSelector } from '@ngrx/store';
import type { AppStateType } from '@/app/store/states/app.state';
import type { UserStateType } from '@/app/store/states/user.state';

const selectUserState = (state: AppStateType): UserStateType => state.user;

export const selectElo = createSelector(selectUserState, (state) => state.elo);

export const selectGamesPlayed = createSelector(
  selectUserState,
  (state) => state.gamesPlayed,
);
