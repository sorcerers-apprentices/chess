import type {
  ColorDark,
  ColorLight,
  Square,
  SquareColor,
  SquareState,
} from '@/app/types/chess-square.type';
import { FILES, RANKS } from '@/app/types/chess-square.type';

export const RANKS_TOP_DOWN = [...RANKS].reverse();

export const LIGHT: ColorLight = 'var(--tui-chart-categorical-18)';
export const DARK: ColorDark = 'var(--tui-background-accent-3)';

/** Готовые 64 клетки с цветами (никакой логики в шаблоне) */
export const SQUARE_STATES: readonly SquareState[] =
  ((): readonly SquareState[] => {
    const acc: SquareState[] = [];
    for (const rank of RANKS_TOP_DOWN) {
      for (const file of FILES) {
        const square: Square = `${file}${rank}`;

        // Чётность по индексам из исходных массивов (без «0..7»):
        const even = (RANKS.indexOf(rank) + FILES.indexOf(file)) % 2 === 0;

        const squareColor: SquareColor = even ? LIGHT : DARK;

        acc.push({ square, squareColor, piece: null });
      }
    }
    return acc;
  })();
