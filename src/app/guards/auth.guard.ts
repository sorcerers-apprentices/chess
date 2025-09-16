import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { LOCAL_STORAGE_KEY } from '../constants/auth.constants';

export const authenticatedGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  return token !== null ? true : router.parseUrl('signin');
};

export const anonymousGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  return token !== null ? router.parseUrl('game') : true;
};
