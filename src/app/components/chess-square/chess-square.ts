import type { Signal } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type {
  SquareType,
  SquareColorType,
  PieceType,
} from '@/app/types/chess-square.type';

import { PIECE_ICON_URL } from '@/app/constants/chess-piece.constans';

@Component({
  selector: 'app-chess-square',
  imports: [],
  templateUrl: './chess-square.html',
  styleUrl: './chess-square.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessSquare {
  public readonly square = input.required<SquareType>();
  public readonly backgroundColor = input.required<SquareColorType>();
  public readonly piece = input<PieceType | null>(null);

  protected readonly icon: Signal<string> = computed(() => {
    const p = this.piece();
    return p ? PIECE_ICON_URL[p.kind][p.color] : '';
  });

  protected readonly altText = computed(() => {
    const p = this.piece();
    return p ? `${p.color} ${p.kind}` : '';
  });

  protected readonly hasPiece = computed(() => this.piece() !== null);
}
