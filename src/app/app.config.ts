import {
  isDevMode,
  provideZonelessChangeDetection,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { appRoutes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import type { ApplicationConfig } from '@angular/core';
import { provideRouterStore } from '@ngrx/router-store';
import { appEffects } from './store/effects/app.effects';
import { provideHttpClient } from '@angular/common/http';
import { getInitialState } from './store/states/app.state';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appReducers } from './store/reducers/app.reducers';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideRouter, withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideEventPlugins(),
    provideStore(appReducers, { initialState: getInitialState }),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects(appEffects),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
