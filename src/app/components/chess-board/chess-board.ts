import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  SquareType,
  SquareUiStateType,
} from '@/app/types/chess-square.type';
import { FILES } from '@/app/types/chess-square.type';
import { RANKS_TOP_DOWN } from '@/app/constants/chess-square.constans';
import { ChessSquare } from '@/app/components/chess-square/chess-square';
import { BoardSetupService } from '@/app/services/board-setup.service';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';

@Component({
  selector: 'app-chess-board',
  imports: [ChessSquare],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessBoard {
  public readonly orientation = input.required<BoardOrientationType>();
  public readonly move = output<ChessMovePayloadType>();

  protected readonly files = FILES;
  protected readonly ranks = RANKS_TOP_DOWN;
  protected readonly boardSetup = inject(BoardSetupService);
  protected readonly baseSquares = computed(() =>
    this.boardSetup.createInitialSquares(this.orientation()),
  );

  protected readonly squares = computed<readonly SquareUiStateType[]>(() =>
    this.baseSquares().map((s) => {
      const from = this.dragFrom();
      const over = this.dragOver();

      const isFrom = from === s.square;
      const isOver = over === s.square;
      const isOverAllowed = isOver && from !== s.square && from !== null;
      const isOverDenied = isOver && from === s.square;

      return { ...s, isFrom, isOverAllowed, isOverDenied };
    }),
  );

  // подсветка DnD
  private readonly dragFrom = signal<SquareType | null>(null);
  private readonly dragOver = signal<SquareType | null>(null);

  protected onSquareMove = (e: ChessMovePayloadType): void => {
    // пока лог и сброс подсветки
    console.log('DND move:', e);
    this.dragFrom.set(null);
    this.dragOver.set(null);
    this.move.emit(e);
  };
}
