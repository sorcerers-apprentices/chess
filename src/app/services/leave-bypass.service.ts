import type { WritableSignal } from '@angular/core';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LeaveBypassService {
  private readonly once: WritableSignal<boolean> = signal<boolean>(false);

  /** Включить байпас ровно на один переход */
  public bypassOnce(): void {
    this.once.set(true);
  }

  /** Прочитать и тут же сбросить флаг */
  public consume(): boolean {
    const bypassActive: boolean = this.once();
    if (bypassActive) this.once.set(false);
    return bypassActive;
  }
}
