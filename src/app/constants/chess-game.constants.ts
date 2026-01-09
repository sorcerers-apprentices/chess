import { InjectionToken, type WritableSignal } from '@angular/core';
import type { PieceColorType } from '@/app/types/chess-type/chess-square.type';

export const DEFAULT_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const CHOSEN_COLOR_TOKEN = new InjectionToken<
  WritableSignal<PieceColorType>
>('CHOSEN_COLOR_TOKEN');
