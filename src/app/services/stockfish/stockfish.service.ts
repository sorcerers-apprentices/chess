import type { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';

export type StockfishMessage = string; // движок шлёт строки с UCI-логами

@Injectable({
  providedIn: 'root',
})
export class StockfishService implements OnDestroy {
  private readonly worker: Worker = new Worker(
    '/assets/stockfish/stockfish-17.1-lite-single-03e3232.js',
  );

  // лог для проверки
  private printLog: string[] = [];

  constructor() {
    // подписка на ответы движка
    this.worker.addEventListener(
      'message',
      (event: MessageEvent<StockfishMessage>) => {
        const message = event.data;
        this.printLog.push(message);
        // временно выводим в консоль
        // потом делать Signal и в UI
        console.log('[Stockfish]', message);
      },
    );
    // базовая инициализация
    this.sendCommand('uci'); // в движке "режим UCI"
  }

  public sendCommand(command: string): void {
    // Stockfish ожидает строки
    this.worker.postMessage(command);
  }

  public getLog(): readonly string[] {
    return this.printLog;
  }

  public ngOnDestroy(): void {
    this.worker.terminate();
  }
}
