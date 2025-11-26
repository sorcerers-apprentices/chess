import {
  gameOver,
  newGame,
  playMove,
  redoMove,
  undoMove,
} from '@/app/store/actions/game.actions';
import {
  selectChess,
  selectIsGameOver,
  selectOrientation,
} from '@/app/store/selectors/game.selectors';
import type { Chess } from 'chess.js';
import { Store } from '@ngrx/store';

import type { Square, Piece, Color } from 'chess.js';
import { EloService } from '@/app/services/elo.service';

import { computed, inject, Injectable } from '@angular/core';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { clone, load } from '@/app/utilities/chess-piece';
import type { AppStateType } from '@/app/store/states/app.state';
import { EngineService } from '@/app/services/stockfish/engine.service';
import type { PromotionPiece } from '@/app/types/stockfish.type';

export type GameResultType = {
  winner: 'white' | 'black' | null;
  draw: boolean;
};

export type BoardMatrix = (Piece | null)[][];

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject<Store<AppStateType>>(Store);
  private readonly elo = inject(EloService);
  private readonly engine = inject(EngineService);

  private readonly pgn = this.store.selectSignal(selectChess);
  private readonly game = computed(() => load(this.pgn()));

  private readonly orientation = this.store.selectSignal(selectOrientation);
  private readonly isFinished = this.store.selectSignal(selectIsGameOver);

  public newGame(fen: string, orientation: 'white' | 'black'): void {
    this.store.dispatch(newGame({ initialFen: fen, orientation }));
  }

  public playMove(
    from: Square,
    to: Square,
    promotion: PromotionPiece = 'q',
  ): boolean {
    try {
      const chess = clone(this.game());
      const move = chess.move({ from, to, promotion });
      if (move === null) return false;

      const newFen = chess.fen();
      const newPgn = chess.pgn();

      const moveRecord: MoveRecordType = {
        uci: `${move.from}${move.to}${move.promotion ?? ''}`,
        san: move.san,
        move,
        fenAfter: newFen,
        timestamp: Date.now(),
      };

      this.store.dispatch(playMove({ fen: newFen, moveRecord, pgn: newPgn }));
      this.handleGameEnd(chess);

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
    const moves = clone(this.game()).moves({ square, verbose: true });
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

  public getGameResult(): GameResultType {
    return this.evaluateResultFromInstance(this.game());
  }

  public playOpponentMove(): MoveRecordType | null {
    if (this.isFinished()) return null;

    const chess = load(this.pgn());

    const possibleMoves = chess.moves({ verbose: true }) ?? [];

    if (possibleMoves.length === 0) {
      return null;
    }

    const idx = Math.floor(Math.random() * possibleMoves.length);
    const chosen = possibleMoves[idx];

    const moveResult = chess.move({
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion ?? undefined,
    });

    if (moveResult === null) {
      return null;
    }

    const moveRecord: MoveRecordType = {
      uci: `${moveResult.from}${moveResult.to}${moveResult.promotion ?? ''}`,
      san: moveResult.san,
      move: moveResult,
      fenAfter: chess.fen(),
      timestamp: Date.now(),
    };

    // ещё раз проверим прямо перед диспатчем
    if (this.isFinished()) return null;

    this.store.dispatch(
      playMove({ fen: chess.fen(), moveRecord, pgn: chess.pgn() }),
    );
    this.handleGameEnd(chess);
    return moveRecord;
  }

  public handleGameEnd(chess: Chess, manual?: GameResultType): void {
    const result = manual ?? this.evaluateResultFromInstance(chess);
    if (result.draw || result.winner !== null) {
      this.store.dispatch(gameOver({ result, finalFen: chess.fen() }));

      const player: 'white' | 'black' = this.orientation();
      if (result.draw) {
        this.elo.draw();
      } else if (result.winner === player) {
        this.elo.win();
      } else {
        this.elo.loss();
      }
    }
  }

  public evaluateResultFromInstance(chess: Chess): GameResultType {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'black' : 'white';
      return { winner, draw: false };
    }

    if (
      chess.isStalemate() ||
      chess.isThreefoldRepetition() ||
      chess.isInsufficientMaterial() ||
      chess.isDraw()
    ) {
      return { winner: null, draw: true };
    }

    return { winner: null, draw: false };
  }

  public resign(): void {
    const me: 'white' | 'black' = this.orientation();
    const winner: 'white' | 'black' = me === 'white' ? 'black' : 'white';
    const chess = load(this.pgn());

    this.handleGameEnd(chess, { winner, draw: false });
  }

  public isCheck(): boolean {
    return this.game().isCheck();
  }

  public isMate(): boolean {
    return this.game().isCheckmate();
  }

  public kingSquare(color: 'w' | 'b' | 'turn' = 'turn'): Square | null {
    const game: Chess = this.game();
    const targetColor: 'w' | 'b' = color === 'turn' ? game.turn() : color;

    const squares: Square[] = game.findPiece({ type: 'k', color: targetColor });
    return squares.length > 0 ? squares[0] : null;
  }
}
