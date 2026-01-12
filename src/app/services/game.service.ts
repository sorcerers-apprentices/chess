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
import { EloService } from '@/app/services/elo.service';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { MoveRecordType } from '@/app/store/states/game.state';
import { clone, load } from '@/app/utilities/chess-piece';
import type { AppStateType } from '@/app/store/states/app.state';
import { EngineService } from '@/app/services/stockfish/engine.service';
import type { EngineMove } from '@/app/types/stockfish.type';
import type {
  NotationColor,
  NotationSquare,
  PieceColorType,
  PromotionNotationLetter,
} from '@/app/types/chess-type/chess-square.type';
import { toStoredMove } from '@/app/utilities/transformation-chess-move-class';
import { AuthService } from '@/app/services/supabase/auth.service';

export type GameResultType = {
  winner: 'white' | 'black' | null;
  draw: boolean;
};

//export type BoardMatrix = (Piece | null)[][];

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly store = inject<Store<AppStateType>>(Store);
  private readonly elo = inject(EloService);
  private readonly engine = inject(EngineService);
  private readonly auth = inject(AuthService);

  private readonly pgn = this.store.selectSignal(selectChess);
  private readonly game = computed(() => load(this.pgn()));

  private readonly orientation = this.store.selectSignal(selectOrientation);
  private readonly isFinished = this.store.selectSignal(selectIsGameOver);
  private readonly lastEngineMove = signal<EngineMove | null>(null);

  public readonly lastEngineMoveSignal = this.lastEngineMove.asReadonly();

  public newGame(fen: string, orientation: 'white' | 'black'): void {
    this.store.dispatch(newGame({ initialFen: fen, orientation }));
  }

  public playMove(
    from: NotationSquare,
    to: NotationSquare,
    promotion: PromotionNotationLetter = 'q',
  ): boolean {
    try {
      const chess = clone(this.game());
      const move = chess.move({ from, to, promotion });
      if (move === null) return false;

      const newFen = chess.fen();
      const newPgn = chess.pgn();

      const ply = chess.history().length; // после move() история уже включает этот полуход
      const playerId = this.auth.getUserData().user.id;

      const moveRecord: MoveRecordType = {
        move: toStoredMove(move),
        fenAfter: newFen,
        timestamp: Date.now(),

        ply,
        player_id: playerId,
        is_check: this.isCheck(),
        is_checkmate: this.isMate(),
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

  public getTargets(square: NotationSquare): readonly NotationSquare[] {
    const moves = clone(this.game()).moves({ square, verbose: true });
    return moves.map((move) => move.to);
  }

  public getTargetsSet(square: NotationSquare): ReadonlySet<NotationSquare> {
    return new Set(this.getTargets(square));
  }

  // возвращает очередь хода
  public turn(): NotationColor {
    return this.game().turn();
  }

  // есть ли фигура на клетке и какого цвета
  public pieceColorAt(square: NotationSquare): NotationColor | null {
    const piece = this.game().get(square);
    return piece ? piece.color : null;
  }

  public getGameResult(): GameResultType {
    return this.evaluateResultFromInstance(this.game());
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

  public kingSquare(color: 'w' | 'b' | 'turn' = 'turn'): NotationSquare | null {
    const game: Chess = this.game();
    const targetColor: 'w' | 'b' = color === 'turn' ? game.turn() : color;

    const squares: NotationSquare[] = game.findPiece({
      type: 'k',
      color: targetColor,
    });
    return squares.length > 0 ? squares[0] : null;
  }

  public async playEngineMove(): Promise<MoveRecordType | null> {
    // партия уже закончена — ничего не делаем
    if (this.isFinished()) return null;

    try {
      // текущее состояние партии
      const chess = this.game();
      const fen = chess.fen();

      // чей ход по мнению chess.js
      const sideToMove = chess.turn() === 'w' ? 'white' : 'black';

      // цвет игрока (выбран на HomePage и хранится в сторе)
      const me: PieceColorType = this.orientation();

      // движок играет за противоположный цвет
      const engineSide: PieceColorType = me === 'white' ? 'black' : 'white';

      // если сейчас не очередь движка — выходим
      if (sideToMove !== engineSide) {
        return null;
      }

      // запрос у движка лучшего хода из текущей позиции
      const best = await this.engine.getBestMove(fen);

      if (!best) {
        console.warn('[GameService] Engine returned no move');
        return null;
      }

      // ход к локальной копии позиции
      const moveResult = chess.move({
        from: best.from,
        to: best.to,
        promotion: best.promotion ?? 'q',
      });

      if (moveResult === null) {
        console.warn('[GameService] Engine move is invalid:', best);
        return null;
      }

      // фиксируем последний РЕАЛЬНЫЙ ход движка для UI
      this.lastEngineMove.set({
        from: best.from,
        to: best.to,
        promotion: best.promotion,
        raw: `${best.from}${best.to}${best.promotion ?? ''}`,
      });

      const newFen = chess.fen();
      const newPgn = chess.pgn();
      const ply = chess.history().length;

      const moveRecord: MoveRecordType = {
        move: toStoredMove(moveResult),
        timestamp: Date.now(),
        fenAfter: newFen,

        ply,
        player_id: null,
        is_check: this.isCheck(),
        is_checkmate: this.isMate(),
      };

      // ещё раз проверка перед диспатчем
      if (this.isFinished()) {
        return null;
      }

      this.store.dispatch(playMove({ fen: newFen, moveRecord, pgn: newPgn }));

      this.handleGameEnd(chess);

      return moveRecord;
    } catch (error) {
      console.error('[GameService] playEngineMove failed:', error);
      return null;
    }
  }
}
