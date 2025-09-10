import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type {
  SquareType,
  SquareColorType,
} from '@/app/types/chess-square.type';

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
}
