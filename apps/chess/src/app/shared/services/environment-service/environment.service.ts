import { Injectable } from '@angular/core';
import { type Environment } from '../../types/environment';
import process from 'node:process';

const requiredString = (key: string): string => {
  const value = process.env[key]
  if (value) {
    return value
  }
  throw new Error(`${key} is not a valid environment key`)
}

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService implements Environment {
  public readonly PUBLISHABLE_KEY = requiredString('PUBLISHABLE_KEY');
  public readonly API_URL = requiredString('API_URL');
}
