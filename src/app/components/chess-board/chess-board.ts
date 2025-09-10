import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FILES } from '@/app/types/chess-square.type';
import {
  RANKS_TOP_DOWN,
  SQUARE_STATES,
} from '@/app/constants/chess-square.constans';
import { ChessSquare } from '@/app/components/chess-square/chess-square';

@Component({
  selector: 'app-chess-board',
  imports: [ChessSquare],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessBoard {
  protected readonly files = FILES;
  protected readonly ranks = RANKS_TOP_DOWN;
  protected readonly squares = SQUARE_STATES;
}
