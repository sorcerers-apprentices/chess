import {
  isDevMode,
  ApplicationConfig,
  provideZoneChangeDetection,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { appRoutes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouter } from '@angular/router';
import { provideRouterStore } from '@ngrx/router-store';
import { appEffects } from './store/effects/app.effects';
import { getInitialState } from './store/states/app.state';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appReducers } from './store/reducers/app.reducers';
import { provideEventPlugins } from '@taiga-ui/event-plugins';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideEventPlugins(),
    provideStore(appReducers, { initialState: getInitialState }),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects(appEffects),
  ],
};
