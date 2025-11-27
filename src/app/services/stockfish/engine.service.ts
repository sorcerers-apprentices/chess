import { inject, Injectable } from '@angular/core';
import { StockfishService } from '@/app/services/stockfish/stockfish.service';
import type {
  EngineDifficultyConfig,
  EngineMove,
  EngineRequestOptions,
  GameDifficulty,
  PromotionPiece,
  WaitForBestMoveOptions,
} from '@/app/types/stockfish.type';
import { ENGINE_DIFFICULTY_PRESETS } from '@/app/types/stockfish.type';
import {
  ENGINE_DEFAULT_DIFFICULTY,
  ENGINE_POLL_INTERVAL_MS,
} from '@/app/constants/stockfish.constans';
import type { Square } from 'chess.js';

function isSquare(value: string): value is Square {
  // файл от 'a' до 'h' и ранг от '1' до '8'
  return /^[a-h][1-8]$/.test(value);
}

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private readonly stockfish = inject(StockfishService);

  private currentDifficulty: GameDifficulty = ENGINE_DEFAULT_DIFFICULTY;

  // ==================
  // СЛОЖНОСТЬ ДЛЯ ИГРЫ
  // ==================

  public setDifficulty(difficulty: GameDifficulty): void {
    this.currentDifficulty = difficulty;

    const config = ENGINE_DIFFICULTY_PRESETS[difficulty];

    // официальная опция Stockfish: Skill Level 0–20
    this.stockfish.setSkillLevel(config.skill);

    // UCI_Elo тут не трогаем, чтобы не смешивать с игровым рейтингом
  }

  public getDifficulty(): GameDifficulty {
    return this.currentDifficulty;
  }

  // =====================
  // ГЛАВНЫЙ МЕТОД ДЛЯ ИГРЫ
  // =====================

  public async getBestMove(
    fen: string,
    options: EngineRequestOptions = {},
  ): Promise<EngineMove | null> {
    const difficultyConfig = this.getDifficultyConfig();

    const {
      depth = difficultyConfig.depth,
      timeoutMs = difficultyConfig.timeoutMs,
      signal,
    } = options;

    try {
      if (this.stockfish.status() !== 'ready') {
        console.warn('Stockfish is not ready');
        return null;
      }

      // сбрасываем состояние перед новым анализом
      this.stockfish.lastBestMove.set(null);
      this.stockfish.lastInfoLine.set(null);

      this.stockfish.setFen(fen);
      this.stockfish.analyzeDepth(depth);

      const bestRaw = await this.waitForBestMove({ timeoutMs, signal });
      const parsed = this.parseEngineMove(bestRaw);

      return parsed;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Engine analysis aborted') {
          // отмена через AbortController → ок, просто возврат null
          return null;
        }

        if (err.message === 'Stockfish did not return bestmove in time') {
          console.warn('Stockfish timeout:', err.message);
          this.stockfish.stop();
          return null;
        }
      }

      console.error('Engine analysis failed:', err);
      this.stockfish.stop();
      return null;
    }
  }

  private getDifficultyConfig(): EngineDifficultyConfig {
    return ENGINE_DIFFICULTY_PRESETS[this.currentDifficulty];
  }

  // ===============================
  // ОЖИДАНИЕ bestmove С ТАЙМАУТОМ
  // ===============================

  private waitForBestMove(options: WaitForBestMoveOptions): Promise<string> {
    const { timeoutMs, signal } = options;

    return new Promise((resolve, reject) => {
      const start = performance.now();
      let pollTimeoutId: number | null = null;

      const cleanup = (): void => {
        if (pollTimeoutId !== null) {
          clearTimeout(pollTimeoutId);
          pollTimeoutId = null;
        }
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
      };

      const onAbort = (): void => {
        cleanup();
        reject(new Error('Engine analysis aborted'));
      };

      if (signal != null && signal.aborted) {
        reject(new Error('Engine analysis aborted'));
        return;
      }

      if (signal) {
        signal.addEventListener('abort', onAbort);
      }

      const check = (): void => {
        if (signal != null && signal.aborted) {
          cleanup();
          reject(new Error('Engine analysis aborted'));
          return;
        }

        const best = this.stockfish.lastBestMove(); // signal → читаем как функцию

        if (best) {
          cleanup();
          resolve(best.move); // напр. 'e7e8q'
          return;
        }

        if (performance.now() - start >= timeoutMs) {
          cleanup();
          reject(new Error('Stockfish did not return bestmove in time'));
          return;
        }

        pollTimeoutId = window.setTimeout(check, ENGINE_POLL_INTERVAL_MS);
      };

      // стартуем цикл проверки
      pollTimeoutId = window.setTimeout(check, 0);
    });
  }

  // =========================
  // ПАРСИНГ СТРОКИ ХОДА ДВИЖКА
  // =========================

  private parseEngineMove(best: string): EngineMove | null {
    if (!best || best.length < 4) {
      console.warn('Stockfish returned invalid bestmove:', best);
      return null;
    }

    if (best === '0000') {
      console.warn('No legal moves from engine:', best);
      return null;
    }

    const fromStr = best.slice(0, 2);
    const toStr = best.slice(2, 4);

    if (!isSquare(fromStr) || !isSquare(toStr)) {
      console.warn('Engine returned invalid square:', best);
      return null;
    }

    const from: Square = fromStr;
    const to: Square = toStr;

    let promotion: PromotionPiece | undefined;

    // e7e8q → q — фигура для промоции
    if (best.length >= 5) {
      const promoChar = best[4].toLowerCase();

      if (
        promoChar === 'q' ||
        promoChar === 'r' ||
        promoChar === 'b' ||
        promoChar === 'n'
      ) {
        promotion = promoChar;
      } else {
        console.warn('Unknown promotion piece from engine:', best);
      }
    }

    return { from, to, promotion, raw: best };
  }
}
