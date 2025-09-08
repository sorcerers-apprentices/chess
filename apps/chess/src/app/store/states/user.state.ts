import type { User } from '../../types/sign-up.type';

export const userInitialState: UserState = {
  user: null,
};

export type UserState = {
  user: User | null;
};
