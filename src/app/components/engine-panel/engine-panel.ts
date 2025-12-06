import type { Signal, WritableSignal } from '@angular/core';
import { input } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { EngineService } from '@/app/services/stockfish/engine.service';
import { StockfishService } from '@/app/services/stockfish/stockfish.service';
import type {
  BestMove,
  EngineDifficultyConfig,
  EngineStatus,
  GameDifficulty,
} from '@/app/types/stockfish.type';
import { ENGINE_DIFFICULTY_PRESETS } from '@/app/types/stockfish.type';
import { DIFFICULTY_LABELS, STATUS_LABELS } from '@/app/types/stockfish.type';
import { EQUAL_POSITION_THRESHOLD_CP } from '@/app/constants/stockfish.constans';

@Component({
  selector: 'app-engine-panel',
  imports: [],
  templateUrl: './engine-panel.html',
  styleUrl: './engine-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnginePanel {
  private readonly stockfishService: StockfishService =
    inject(StockfishService);
  private readonly engineService: EngineService = inject(EngineService);

  // Запросил ли пользователь подсказку
  private readonly hintRequested: WritableSignal<boolean> = signal(false);

  // сырой bestmove от движка
  private readonly lastBestMove: WritableSignal<BestMove | null> =
    this.stockfishService.lastBestMove;

  public readonly fen = input.required<string>();

  private readonly lastHintFen = signal<string | null>(null);

  // статус движка
  public readonly status: WritableSignal<EngineStatus> =
    this.stockfishService.status;

  // думает ли сейчас
  public readonly thinking: WritableSignal<boolean> =
    this.stockfishService.thinking;

  // читаем сложность из EngineService
  public readonly difficulty: Signal<GameDifficulty> = computed<GameDifficulty>(
    (): GameDifficulty => this.engineService.getDifficulty(),
  );

  public readonly hasPonder: Signal<boolean> = computed((): boolean => {
    const move: BestMove | null = this.lastBestMove();
    return move !== null && move.ponder !== null && move.ponder !== undefined;
  });

  public readonly hasHint: Signal<boolean> = computed((): boolean => {
    const move = this.lastBestMove();
    const currentFen = this.fen();
    const hintFen = this.lastHintFen();

    if (move === null) {
      return false;
    }

    if (move.bestMove === undefined || move.bestMove === '') {
      return false;
    }

    if (hintFen === null) {
      return false;
    }

    return hintFen === currentFen;
  });

  // последняя info-строка
  public readonly lastInfoLine: WritableSignal<string | null> =
    this.stockfishService.lastInfoLine;

  public readonly log: WritableSignal<string[]> = this.stockfishService.log;

  public readonly statusLabel: Signal<string> = computed(
    (): string => STATUS_LABELS[this.status()],
  );

  public readonly thinkingLabel = computed(() => {
    const status: EngineStatus = this.status();
    const thinking: boolean = this.thinking();

    if (status === 'error') {
      return 'Unavailable';
    }

    if (status === 'not-ready') {
      return 'Initializing';
    }

    // status === 'ready'
    return thinking ? 'Thinking' : 'Waiting for move';
  });

  public readonly difficultyLabel: Signal<string> = computed(
    (): string => DIFFICULTY_LABELS[this.difficulty()],
  );

  // skill level из пресета
  public readonly skillLevelLabel: Signal<string> = computed(
    (): string => `${this.difficultyConfig().skill}`,
  );

  // глубина анализа
  public readonly depthLabel: Signal<string> = computed(
    (): string => `${this.difficultyConfig().depth}`,
  );

  public readonly hasLastBestMove: Signal<boolean> = computed(
    (): boolean => this.lastBestMove() !== null,
  );

  public readonly hasEvaluation: Signal<boolean> = computed(() => {
    return this.stockfishService.lastEvaluation() !== null;
  });

  public readonly engineMoveHuman: Signal<string> = computed((): string => {
    const move = this.lastBestMove();

    if (!move || !move.bestMove) {
      return '—';
    }

    return this.formatUciMove(move.bestMove);
  });

  public readonly playerPonderHuman: Signal<string> = computed((): string => {
    const move = this.lastBestMove();

    if (!move || move.ponder == null) {
      return '—';
    }

    return this.formatUciMove(move.ponder);
  });

  public readonly playerHintHuman: Signal<string> = computed((): string => {
    const move = this.lastBestMove();
    const currentFen = this.fen();
    const hintFen = this.lastHintFen();

    if (!move || !move.bestMove || hintFen === null || hintFen !== currentFen) {
      return '—';
    }

    return this.formatUciMove(move.bestMove);
  });

  public readonly positionSummaryLabel: Signal<string> = computed(() => {
    const evalData = this.stockfishService.lastEvaluation();

    if (!evalData) {
      return 'No evaluation';
    }

    const { cp, mate } = evalData;

    if (typeof mate === 'number') {
      const moves = Math.abs(mate);

      if (moves === 1) {
        return 'Checkmate in 1 move';
      }

      return `Checkmate in ${moves} moves`;
    }

    if (cp === null || cp === undefined) {
      return 'No evaluation';
    }

    if (Math.abs(cp) < EQUAL_POSITION_THRESHOLD_CP) {
      return 'Equal position';
    }

    if (cp > 0) {
      return 'White has the advantage';
    }

    return 'Black has the advantage';
  });

  private readonly difficultyConfig: Signal<EngineDifficultyConfig> =
    computed<EngineDifficultyConfig>((): EngineDifficultyConfig => {
      const difficulty: GameDifficulty = this.difficulty();
      return ENGINE_DIFFICULTY_PRESETS[difficulty];
    });

  public onShowHintClick(): void {
    const currentFen = this.fen();

    this.lastHintFen.set(currentFen);

    this.stockfishService.setFen(currentFen);
    this.stockfishService.analyzeDepth(12);
  }

  private formatUciMove(uci: string): string {
    if (!uci || uci.length < 4) {
      return uci || '—';
    }

    const from: string = uci.slice(0, 2);
    const to: string = uci.slice(2, 4);

    return `${from} → ${to}`;
  }
}
