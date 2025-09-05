import type { Route } from '@angular/router';

export const AppRoutes = {
  MAIN: 'main',
  GAME: 'game',
  LOGIN: 'login',
  NOT_FOUND: 'not_found',
} as const;

type AppRouteType = (typeof AppRoutes)[keyof typeof AppRoutes];

export const RoutePath: Record<AppRouteType, string> = {
  [AppRoutes.MAIN]: '',
  [AppRoutes.GAME]: 'game',
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
      import('../pages/game-page/game-page').then((m) => m.GamePage),
  },
];
