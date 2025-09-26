import { Injectable } from '@angular/core';
import type { PreloadingStrategy } from '@angular/router';
import { type Route } from '@angular/router';
import { type Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  public preload(
    route: Route,
    load: () => Observable<unknown>,
  ): Observable<unknown> {
    return Boolean(route.data?.['preload']) ? load() : of(null);
  }
}
