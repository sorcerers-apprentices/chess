import type { WritableSignal } from '@angular/core';
import { inject } from '@angular/core';
import { Injectable, signal } from '@angular/core';
import { PlayerTimerService } from '@/app/services/player-timer.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveBypassService {
  private readonly once: WritableSignal<boolean> = signal<boolean>(false);
  private readonly timer = inject(PlayerTimerService);

  /** Включить байпас ровно на один переход */
  public bypassOnce(): void {
    console.log('[BYPASS] bypassOnce() → reset + flag');
    this.timer.reset();
    this.once.set(true);
  }

  /** Прочитать и тут же сбросить флаг */
  public consume(): boolean {
    const bypassActive: boolean = this.once();
    if (bypassActive) this.once.set(false);
    return bypassActive;
  }
}
