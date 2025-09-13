import { type CanActivateFn, type Route, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LOCAL_STORAGE_KEY } from '@/app/constants/constants';

export const AppRoutes = {
  MAIN: 'main',
  GAME: 'game',
  SIGN_UP: 'signup',
  SIGN_IN: 'signin',
  NOT_FOUND: 'not_found',
} as const;

type AppRouteType = (typeof AppRoutes)[keyof typeof AppRoutes];
export type RoutePathValue = (typeof RoutePath)[keyof typeof RoutePath];

export const RoutePath: Record<AppRouteType, string> = {
  [AppRoutes.MAIN]: '',
  [AppRoutes.GAME]: 'game',
  [AppRoutes.SIGN_UP]: 'signup',
  [AppRoutes.SIGN_IN]: 'signin',
  [AppRoutes.NOT_FOUND]: '**',
};

const authenticatedGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  return token !== null ? true : router.parseUrl('signin');
};

const anonymousGuardFunction: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  return token !== null ? router.parseUrl('game') : true;
};

export const appRoutes: Route[] = [
  {
    path: RoutePath.main,
    redirectTo: RoutePath.game,
    pathMatch: 'full',
  },
  {
    path: RoutePath.game,
    title: 'Chess Game',
    canActivate: [authenticatedGuardFunction],
    loadComponent: () =>
      import('./pages/game-page/game-page').then((m) => m.GamePage),
  },
  {
    path: RoutePath.signup,
    title: 'SignUp | Chess Game',
    canActivate: [anonymousGuardFunction],
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: RoutePath.signin,
    title: 'SignIn | Chess Game',
    canActivate: [anonymousGuardFunction],
    loadComponent: () =>
      import('./pages/sign-in-page/sign-in-page').then((m) => m.SignInPage),
  },
  {
    path: RoutePath.not_found,
    title: '404 | Chess Game',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page').then(
        (m) => m.NotFoundPage,
      ),
  },
];
