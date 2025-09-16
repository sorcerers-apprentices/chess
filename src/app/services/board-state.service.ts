import { computed, inject, Injectable, signal } from '@angular/core';
import type {
  PieceType,
  SquareStateType,
  SquareType,
} from '@/app/types/chess-square.type';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';
import { BoardSetupService } from '@/app/services/board-setup.service';
import type { ChessMovePayloadType } from '@/app/types/drag-drop-data.type';

@Injectable({
  providedIn: 'root',
})
export class BoardStateService {
  // выдает текущее состояние board
  public readonly squares = computed(() => this._squares());
  private readonly _squares = signal<readonly SquareStateType[]>([]);
  private readonly boardSetup = inject(BoardSetupService);

  public init(orientation: BoardOrientationType): void {
    const initial = this.boardSetup.createInitialSquares(orientation);
    this._squares.set(initial);
  }

  /** Узнать фигуру на клетке */
  public pieceAt(square: SquareType): PieceType | null {
    return this._squares().find((s) => s.square === square)?.piece ?? null;
  }

  /** Простое применение хода (без шахматной валидации) */
  public movePiece(payload: ChessMovePayloadType): void {
    const { from, to } = payload;

    if (from === to) {
      console.log('[movePiece] from === to → игнор', { from, to });
      return;
    }

    // игнор «хода в ту же клетку»
    if (from === to) return;

    const list = this._squares();
    const fromCell = list.find((s) => s.square === from);
    const toCell = list.find((s) => s.square === to);

    if (from === to) {
      console.log('[movePiece] from === to → игнор', { from, to });
      return;
    }

    if (!fromCell) {
      console.log('[movePiece] fromCell not found', { from });
      return;
    }
    if (!fromCell.piece) {
      console.log('[movePiece] no piece at from', { from });
      return;
    }
    if (!toCell) {
      console.log('[movePiece] toCell not found', { to });
      return;
    }
    if (toCell.piece && toCell.piece.color === fromCell.piece.color) {
      console.log('[movePiece] target has same-color piece → запрещено', {
        to,
        target: toCell.piece,
      });
      return;
    }

    const moved = fromCell.piece;

    // иммутабельное обновление
    const next: readonly SquareStateType[] = list.map((s) => {
      if (s.square === from) return { ...s, piece: null };
      if (s.square === to) return { ...s, piece: moved };
      return s;
    });

    console.log('[movePiece] OK', { from, to, moved });

    this._squares.set(next);
  }
}
