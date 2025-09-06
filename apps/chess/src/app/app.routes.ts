import type { Route } from '@angular/router';

export const AppRoutes = {
  MAIN: 'main',
  GAME: 'game',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  NOT_FOUND: 'not_found',
} as const;

type AppRouteType = (typeof AppRoutes)[keyof typeof AppRoutes];
export type RoutePathValue = (typeof RoutePath)[keyof typeof RoutePath];

export const RoutePath: Record<AppRouteType, string> = {
  [AppRoutes.MAIN]: '',
  [AppRoutes.GAME]: 'game',
  [AppRoutes.SIGN_UP]: 'sign-up',
  [AppRoutes.LOGIN]: 'login',
  [AppRoutes.NOT_FOUND]: '**',
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
    loadComponent: () =>
      import('./pages/game-page/game-page').then((m) => m.GamePage),
  },
  {
    path: RoutePath.login,
    title: 'SignUp | Chess Game',
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: RoutePath.login,
    title: 'Login | Chess Game',
    loadComponent: () =>
      import('./pages/login-page/login-page').then((m) => m.LoginPage),
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
