import {
  newGame,
  playMove,
  redoMove,
  undoMove,
} from '@/app/store/actions/game.actions';
import { Chess } from 'chess.js';
import { Store } from '@ngrx/store';
import type { Square, Piece, Move, Color } from 'chess.js';
import { computed, inject, Injectable } from '@angular/core';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { selectChessFen } from '@/app/store/selectors/game.selectors';

export type BoardMatrix = (Piece | null)[][];

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject(Store);
  private readonly fen = this.store.selectSignal(selectChessFen);
  private readonly game = computed(() => new Chess(this.fen()));

  public newGame(fen: string, orientation?: 'white' | 'black'): void {
    this.store.dispatch(newGame({ initialFen: fen, orientation }));
  }

  public getBoard(): BoardMatrix {
    return this.game().board();
  }

  public drawAscii(): void {
    console.log(this.game().ascii());
  }

  public getAvailableMoves(square: Square): string[] {
    return this.game().moves({ square }) ?? [];
  }

  public getAllAvailableMoves(): string[] {
    return this.game().moves() ?? [];
  }

  public playMove(from: Square, to: Square): boolean {
    try {
      const chess = new Chess(this.fen());
      const move = chess.move({ from, to });
      if (move === null) return false;

      const moveRecord: MoveRecordType = {
        uci: `${move.from}${move.to}${move.promotion ?? ''}`,
        san: move.san,
        move,
        fenAfter: chess.fen(),
        timestamp: Date.now(),
      };

      this.store.dispatch(playMove({ fen: chess.fen(), moveRecord }));
      return true;
    } catch {
      return false;
    }
  }

  public undoMove(): void {
    this.store.dispatch(undoMove());
  }

  public redoMove(): void {
    this.store.dispatch(redoMove());
  }

  public getTargets(square: Square): readonly Square[] {
    const moves: Move[] = this.game().moves({ square, verbose: true });
    return moves.map((move) => move.to);
  }

  public getTargetsSet(square: Square): ReadonlySet<Square> {
    return new Set(this.getTargets(square));
  }

  // возвращает очередь хода
  public turn(): Color {
    return this.game().turn();
  }

  // есть ли фигура на клетке и какого цвета
  public pieceColorAt(square: Square): Color | null {
    const piece = this.game().get(square);
    return piece ? piece.color : null;
  }

  // даёт полный объект фигуры ({ type: 'p', color: 'w' }).
  public getPieceAt(square: Square): Piece | undefined {
    return this.game().get(square);
  }

  // возвращает всю доску матрицей 8×8 (Piece | null в каждой клетке).
  public getBoardFromFen(fen: string): (Piece | null)[][] {
    const chess = new Chess(fen);
    return chess.board();
  }

  // возвращает только одну фигуру на клетке
  public getPieceAtFromFen(fen: string, square: Square): Piece | undefined {
    const chess = new Chess(fen);
    return chess.get(square);
  }
}
