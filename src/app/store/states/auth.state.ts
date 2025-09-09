import { tokenCacheKey } from '../../constants/constants';

export const authInitialState: AuthState = {
  token: localStorage.getItem(tokenCacheKey),
};

export type AuthState = {
  token: string | null;
};
