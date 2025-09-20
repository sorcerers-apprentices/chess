import type { UserType } from '../../types/sign-up.type';
import { INITIAL_ELO } from '@/app/constants/elo.constants';

export type UserStateType = {
  isAuth: boolean;
  user: UserType | null;
  elo: number;
  gamesPlayed: number;
};

export const initialUserState: UserStateType = {
  isAuth: false,
  user: null,
  elo: INITIAL_ELO,
  gamesPlayed: 0,
};
