import type { OnDestroy } from '@angular/core';
import { signal } from '@angular/core';
import { Injectable } from '@angular/core';
import type {
  BestMove,
  EngineEvaluation,
  EngineStatus,
} from '@/app/types/stockfish.type';

@Injectable({
  providedIn: 'root',
})
export class StockfishService implements OnDestroy {
  public readonly status = signal<EngineStatus>('not-ready');
  public readonly thinking = signal(false);
  public readonly lastBestMove = signal<BestMove | null>(null);
  public readonly lastInfoLine = signal<string | null>(null);
  public readonly lastEvaluation = signal<EngineEvaluation | null>(null);
  public readonly skillLevel = signal<number>(0);
  public readonly log = signal<string[]>([]);

  private worker: Worker | null = null;
  private readonly maxLogLength = 200;

  constructor() {
    try {
      this.worker = new Worker(
        '/assets/stockfish/stockfish-17.1-lite-single-03e3232.js',
      );

      this.worker.addEventListener('message', (event: MessageEvent<string>) => {
        this.handleEngineOutput(event.data);
      });

      this.worker.addEventListener('error', (event: ErrorEvent) => {
        console.error('Stockfish worker error:', event.message);
        this.status.set('error');
        this.thinking.set(false);

        // завершить воркер
        this.worker?.terminate();
        this.worker = null;
      });

      this.sendRaw('uci');
    } catch (error) {
      console.error('Failed to initialize Stockfish worker', error);
      this.status.set('error');
      this.thinking.set(false);
    }
  }

  public newGame(): void {
    this.lastBestMove.set(null);
    this.lastEvaluation.set(null);
    this.lastInfoLine.set(null);
    this.thinking.set(false);
    this.sendRaw('ucinewgame');
  }

  public setFen(fen: string): void {
    this.sendRaw(`position fen ${fen}`);
  }

  public analyzeDepth(depth: number): void {
    if (this.status() !== 'ready') {
      console.warn('Stockfish not ready');
      return;
    }

    this.thinking.set(true);

    this.lastBestMove.set(null);
    this.lastInfoLine.set(null);
    this.lastEvaluation.set(null);

    this.sendRaw(`go depth ${depth}`);
  }

  public stop(): void {
    this.thinking.set(false);
    this.sendRaw('stop');
  }

  public setSkillLevel(level: number): void {
    const normalized = Math.min(20, Math.max(0, level));
    this.skillLevel.set(normalized);
    this.sendRaw(`setoption name Skill Level value ${normalized}`);
  }

  public setElo(elo: number): void {
    this.sendRaw(`setoption name UCI_LimitStrength value true`);
    this.sendRaw(`setoption name UCI_Elo value ${elo}`);
  }

  public ngOnDestroy(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private sendRaw(command: string): void {
    if (!this.worker) {
      console.warn('Stockfish worker is not initialized');
      return;
    }
    if (this.status() === 'error') {
      console.warn('Stockfish is in error state');
      return;
    }

    try {
      this.worker.postMessage(command);
      this.pushLog(`>>> ${command}`);
    } catch (error) {
      console.error('Failed to send command to Stockfish:', error);
      this.status.set('error');
      this.thinking.set(false);
    }
  }

  private pushLog(message: string): void {
    console.log(message);
    this.log.update((current: string[]): string[] => {
      const next: string[] = [...current, message];
      if (next.length > this.maxLogLength) {
        next.shift();
      }
      return next;
    });
  }

  private handleEngineOutput(line: string): void {
    if (
      line.startsWith('option ') ||
      line.startsWith('id name') ||
      line.startsWith('id author') ||
      line.startsWith('Stockfish ')
    ) {
      return;
    }

    this.pushLog(`<<< ${line}`);

    if (line.startsWith('info ')) {
      this.lastInfoLine.set(line);

      const evaluation = this.parseEvaluationFromInfo(line);
      if (evaluation) {
        this.lastEvaluation.set(evaluation);
      }
      return;
    }

    //this.pushLog(`<<< ${line}`);

    if (line === 'uciok') {
      this.sendRaw('isready');
      return;
    }

    if (line === 'readyok') {
      this.status.set('ready');
      return;
    }

    if (line.startsWith('bestmove')) {
      const parsed = this.parseBestMove(line);
      this.lastBestMove.set(parsed);
      this.thinking.set(false);
      return;
    }
  }

  private parseBestMove(line: string): BestMove {
    const parts = line.split(/\s+/);
    const bestMove = parts[1] ?? '';
    let ponder: string | undefined;

    const idx = parts.indexOf('ponder');
    if (idx !== -1 && parts[idx + 1]) {
      ponder = parts[idx + 1];
    }

    return { bestMove, ponder };
  }

  private parseEvaluationFromInfo(infoLine: string): EngineEvaluation | null {
    const parts = infoLine.split(/\s+/);

    const scoreIndex = parts.indexOf('score');
    if (scoreIndex === -1) {
      return null;
    }

    const type = parts[scoreIndex + 1]; // 'cp' or 'mate'
    const valueRaw = parts[scoreIndex + 2];
    if (!type || !valueRaw) {
      return null;
    }

    const value = Number.parseInt(valueRaw, 10);
    if (Number.isNaN(value)) {
      return null;
    }

    if (type === 'cp') {
      return {
        cp: value,
        mate: null,
      };
    }

    if (type === 'mate') {
      return {
        cp: null,
        mate: value,
      };
    }

    return null;
  }
}
