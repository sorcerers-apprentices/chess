import { computed, inject, Injectable, type Signal } from '@angular/core';
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
import { Chess, type Piece, type Square } from 'chess.js';
import { Store } from '@ngrx/store';
import { load } from '@/app/utilities/chess-piece';
import type { AppStateType } from '@/app/store/states/app.state';
import { GameViewerService } from '@/app/services/game-viewer.service';

@Injectable({
  providedIn: 'root',
})
export class BoardSetupService {
  public readonly squaresBoard = computed<readonly SquareStateType[]>(() => {
    const matrix = this.game().board();
    return this.createInitialSquaresPieces(matrix);
  });

  protected readonly store: Store<AppStateType> =
    inject<Store<AppStateType>>(Store);
  protected readonly viewer: GameViewerService = inject(GameViewerService);

  protected readonly pgn: Signal<string> = this.store.selectSignal(
    (state: AppStateType): string => state.game.pgn,
  );
  protected readonly game: Signal<Chess> = computed((): Chess => {
    const value: string = this.pgn();
    if (this.viewer.isViewing()) {
      return new Chess(this.viewer.viewFen());
    }
    return load(value);
  });
  protected readonly fen: Signal<string> = computed((): string =>
    this.game().fen(),
  );
  protected readonly orientation = this.store.selectSignal(
    (state: AppStateType) => state.game.orientation,
  );

  public createInitialSquaresPieces(board: BoardMatrix): SquareStateType[] {
    const ranksOrder = this.orientation() === 'white' ? RANKS_TOP_DOWN : RANKS;
    const filesOrder =
      this.orientation() === 'white' ? FILES : [...FILES].reverse();

    const acc: SquareStateType[] = [];

    for (const rank of ranksOrder) {
      const rowIndex: number = RANK_8 - Number(rank);
      const row = board[rowIndex];

      for (const file of filesOrder) {
        const colIndex: number = FILES.indexOf(file);
        const enginePiece = row[colIndex];

        const square: SquareType = `${file}${rank}`;

        const even: boolean = (Number(rank) - 1 + colIndex) % 2 === 0;
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
    return this.game().get(square);
  }
}
