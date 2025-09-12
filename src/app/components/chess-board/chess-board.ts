import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FILES } from '@/app/types/chess-square.type';
import { RANKS_TOP_DOWN } from '@/app/constants/chess-square.constans';
import { ChessSquare } from '@/app/components/chess-square/chess-square';
import { BoardSetupService } from '@/app/services/board-setup.service';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';

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
  protected readonly boardSetup = inject(BoardSetupService);
  protected readonly orientation: BoardOrientationType = 'whiteBottom';
  protected readonly squares = this.boardSetup.createInitialSquares(
    this.orientation,
  );
}
