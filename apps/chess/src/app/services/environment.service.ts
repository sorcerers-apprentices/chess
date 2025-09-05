import { Injectable } from '@angular/core';
import { type Environment } from '../../types/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService implements Environment {
  public readonly publishableKey = PUBLISHABLE_KEY;
  public readonly apiUrl = API_URL;
}
