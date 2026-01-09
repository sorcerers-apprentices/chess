import { Injectable } from '@angular/core';
import type { PersistShape } from '@/app/types/chess-type/chess-piece.type';

@Injectable({
  providedIn: 'root',
})
export class TimerStorageService {
  public read(base: string): PersistShape | null {
    const raw: string | null = localStorage.getItem(base);
    if (raw === null || raw === '') return null;
    try {
      const variant: PersistShape = JSON.parse(raw);
      if (typeof variant.since === 'number' || variant.since === null) {
        return variant;
      }
    } catch {}
    return null;
  }

  public write(base: string, value: PersistShape): void {
    try {
      localStorage.setItem(base, JSON.stringify(value));
    } catch {}
  }

  public clear(base: string): void {
    try {
      localStorage.removeItem(base);
    } catch {}
  }
}
