import { computed, inject, Injectable } from '@angular/core';
import type {
  SquareColorType,
  SquareStateType,
  SquareType,
} from '@/app/types/chess-square.type';
import { RANK_8 } from '@/app/types/chess-square.type';
import { FILES, RANKS } from '@/app/types/chess-square.type';
import {
  DARK,
  LIGHT,
  RANKS_TOP_DOWN,
} from '@/app/constants/chess-square.constans';
import type { BoardMatrix } from '@/app/services/game.service';
import { GameService } from '@/app/services/game.service';
import type { Piece, Square } from 'chess.js';
import { Store } from '@ngrx/store';
import type { GameStateType } from '@/app/store/states/game.state';

@Injectable({
  providedIn: 'root',
})
export class BoardSetupService {
  // выдает текущее состояние board

  public readonly squaresBoard = computed<readonly SquareStateType[]>(() => {
    const fen = this.fen();
    const matrix = this.game.getBoardFromFen(fen);
    return this.createInitialSquaresPieces(matrix);
  });

  protected readonly store: Store<{ game: GameStateType }> = inject(
    Store<{ game: GameStateType }>,
  );

  protected readonly fen = this.store.selectSignal((state) => state.game.fen);
  protected readonly orientation = this.store.selectSignal(
    (state) => state.game.orientation,
  );

  private readonly game = inject(GameService);

  public createInitialSquaresPieces(board: BoardMatrix): SquareStateType[] {
    const ranksOrder = this.orientation() === 'white' ? RANKS_TOP_DOWN : RANKS;
    const filesOrder =
      this.orientation() === 'white' ? FILES : [...FILES].reverse();

    const acc: SquareStateType[] = [];

    for (const rank of ranksOrder) {
      const rowIndex = RANK_8 - Number(rank);
      const row = board[rowIndex];

      for (const file of filesOrder) {
        const colIndex = FILES.indexOf(file);
        const enginePiece = row[colIndex];

        const square: SquareType = `${file}${rank}`;

        const even = (Number(rank) - 1 + colIndex) % 2 === 0;
        const squareColor: SquareColorType = even ? LIGHT : DARK;

        acc.push({
          square,
          squareColor,
          piece: enginePiece,
        });
      }
    }
    return acc;
  }

  /** Узнать фигуру на клетке для подсветки допустимых ходов, правила шахматной логики */
  public pieceAt(square: Square): Piece | undefined {
    return this.game.getPieceAtFromFen(this.fen(), square);
  }
}
