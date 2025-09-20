import {
  newGame,
  playMove,
  redoMove,
  undoMove,
} from '@/app/store/actions/game.actions';
import { Chess } from 'chess.js';
import { Store } from '@ngrx/store';
import type { Square, Piece } from 'chess.js';
import { computed, inject, Injectable } from '@angular/core';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { selectChessFen } from '@/app/store/selectors/game.selectors';

type BoardMatrix = (Piece | null)[][];

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject(Store);
  private readonly fen = this.store.selectSignal(selectChessFen);
  private readonly game = computed(() => new Chess(this.fen()));

  public newGame(fen: string): void {
    this.store.dispatch(newGame({ initialFen: fen }));
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
}
