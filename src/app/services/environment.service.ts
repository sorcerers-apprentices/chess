import { Injectable } from '@angular/core';
import type { EnvironmentType } from '../types/environment.type';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService implements EnvironmentType {
  public readonly publishableKey = PUBLISHABLE_KEY;
  public readonly apiUrl = API_URL;
  public readonly redirectURL = REDIRECT_URL;
}
