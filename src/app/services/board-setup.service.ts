import { inject, Injectable } from '@angular/core';
import { ChessPieceIdService } from '@/app/services/chess-piece-id.service';
import type { BoardOrientationType } from '@/app/types/chess-piece.type';
import { isFileType, isRankType } from '@/app/utilities/chess-piece';
import type {
  FileType,
  PieceColorType,
  PieceKindType,
  PieceType,
  RankType,
  SquareStateType,
  SquareType,
} from '@/app/types/chess-square.type';
import { RANK_1, RANK_2, RANK_7, RANK_8 } from '@/app/types/chess-square.type';
import { SQUARE_STATES } from '@/app/constants/chess-square.constans';

@Injectable({
  providedIn: 'root',
})
export class BoardSetupService {
  private readonly pieceFactory = inject(ChessPieceIdService);
  private readonly backRankMap: Record<FileType, PieceKindType> = {
    a: 'rook',
    b: 'knight',
    c: 'bishop',
    d: 'queen',
    e: 'king',
    f: 'bishop',
    g: 'knight',
    h: 'rook',
  };

  public createInitialSquares(
    orientation: BoardOrientationType = 'whiteBottom',
  ): readonly SquareStateType[] {
    return SQUARE_STATES.map((state) => {
      const piece = this.pieceForStart(state.square, orientation);
      // возвращаем новый объект, не мутируя исходный readonly
      return { ...state, piece };
    });
  }

  private pieceForStart(
    square: SquareType,
    orientation: BoardOrientationType,
  ): PieceType | null {
    const fileChar = square.charAt(0);
    const rankNum = Number(square.charAt(1));

    if (!isFileType(fileChar) || !isRankType(rankNum)) return null;

    const file: FileType = fileChar;
    const rank: RankType = rankNum;
    const isWhiteBottom = orientation === 'whiteBottom';

    const whitePawnRank = isWhiteBottom ? RANK_2 : RANK_7;
    const whiteBackRank = isWhiteBottom ? RANK_1 : RANK_8;
    const blackPawnRank = isWhiteBottom ? RANK_7 : RANK_2;
    const blackBackRank = isWhiteBottom ? RANK_8 : RANK_1;

    if (rank === whitePawnRank) return this.make('pawn', 'light');
    if (rank === blackPawnRank) return this.make('pawn', 'dark');

    if (rank === whiteBackRank)
      return this.make(this.backRankKind(file), 'light');
    if (rank === blackBackRank)
      return this.make(this.backRankKind(file), 'dark');

    return null;
  }

  private backRankKind(file: FileType): PieceKindType {
    return this.backRankMap[file];
  }

  private make(kind: PieceKindType, color: PieceColorType): PieceType {
    // единая точка создания фигуры с UUID
    return this.pieceFactory.createPiece(kind, color);
  }
}
