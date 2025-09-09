import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Square, SquareColor } from '@/app/types/chess-square.type';

@Component({
  selector: 'app-chess-square',
  imports: [],
  templateUrl: './chess-square.html',
  styleUrl: './chess-square.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessSquare {
  public readonly square = input.required<Square>();
  public readonly backgroundColor = input.required<SquareColor>();
}
