import type { UserType } from '../../types/sign-up.type';

export type UserStateType = {
  isAuth: boolean;
  user: UserType | null;
  elo: number;
};

export const initialUserState: UserStateType = {
  isAuth: false,
  user: null,
  elo: 0,
};
