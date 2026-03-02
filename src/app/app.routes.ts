import {
  anonymousGuardFunction,
  authenticatedGuardFunction,
  canDeactivatePopup,
} from '@/app/guards/auth.guard';
import { type Route } from '@angular/router';

export const AppRoutes = {
  MAIN: 'main',
  HOME: 'home',
  GAME: 'game/:id',
  SIGN_UP: 'signup',
  SIGN_IN: 'signin',
  ABOUT: 'about',
  RATING: 'rating',
  NOT_FOUND: 'not_found',
  ENGINE_LOG: 'engine_log',
} as const;

type AppRouteType = (typeof AppRoutes)[keyof typeof AppRoutes];
export type RoutePathValue = (typeof RoutePath)[keyof typeof RoutePath];

export const RoutePath: Record<AppRouteType, string> = {
  [AppRoutes.MAIN]: '',
  [AppRoutes.HOME]: 'home',
  [AppRoutes.GAME]: 'game/:id',
  [AppRoutes.SIGN_UP]: 'signup',
  [AppRoutes.SIGN_IN]: 'signin',
  [AppRoutes.ABOUT]: 'about',
  [AppRoutes.RATING]: 'rating',
  [AppRoutes.NOT_FOUND]: '**',
  [AppRoutes.ENGINE_LOG]: 'engine-log',
};

export const appRoutes: Route[] = [
  {
    path: RoutePath.main,
    redirectTo: RoutePath.home,
    pathMatch: 'full',
    data: { preload: true },
  },
  {
    path: RoutePath.home,
    title: 'Home Page',
    canActivate: [authenticatedGuardFunction],
    loadComponent: () =>
      import('./pages/home-page/home-page').then((m) => m.HomePage),
    data: { preload: true },
  },
  {
    path: RoutePath['game/:id'],
    title: 'Chess Game',
    canActivate: [authenticatedGuardFunction],
    canDeactivate: [canDeactivatePopup],
    loadComponent: () =>
      import('./pages/game-page/game-page').then((m) => m.GamePage),
    data: { preload: true },
  },
  {
    path: RoutePath.signup,
    title: 'SignUp | Chess Game',
    canActivate: [anonymousGuardFunction],
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
    data: { preload: false },
  },
  {
    path: RoutePath.signin,
    title: 'SignIn | Chess Game',
    canActivate: [anonymousGuardFunction],
    loadComponent: () =>
      import('./pages/sign-in-page/sign-in-page').then((m) => m.SignInPage),
    data: { preload: true },
  },
  {
    path: RoutePath.about,
    title: 'About | Chess Game',
    loadComponent: () =>
      import('./pages/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: RoutePath.rating,
    title: 'Rating | Chess Game',
    loadComponent: () =>
      import('./pages/rating-page/rating-page').then((m) => m.RatingPage),
  },
  {
    path: RoutePath.engine_log,
    title: 'Stockfish Log | Chess Game',
    canActivate: [authenticatedGuardFunction], // лог доступен только авторизованным
    loadComponent: () =>
      import('./components/stockfish-log/stockfish-log').then(
        (m) => m.StockfishLog,
      ),
    data: { preload: false },
  },
  {
    path: RoutePath.not_found,
    title: '404 | Chess Game',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page').then(
        (m) => m.NotFoundPage,
      ),
    data: { preload: false },
  },
];
