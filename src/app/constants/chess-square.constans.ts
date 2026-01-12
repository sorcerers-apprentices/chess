import type {
  ColorWhiteType,
  ColorBlackType,
} from '@/app/types/chess-type/chess-square.type';
import { RANKS } from '@/app/types/chess-type/chess-square.type';

export const RANKS_TOP_DOWN = [...RANKS].reverse();

export const LIGHT: ColorWhiteType = 'var(--tui-chart-categorical-18)';
export const DARK: ColorBlackType = 'var(--tui-background-elevation-3)';
