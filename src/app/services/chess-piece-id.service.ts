import { Injectable } from '@angular/core';
import type {
  PieceColorType,
  PieceKindType,
  PieceType,
} from '@/app/types/chess-type/chess-square.type';

@Injectable({
  providedIn: 'root',
})
export class ChessPieceIdService {
  public createPiece(kind: PieceKindType, color: PieceColorType): PieceType {
    return {
      id: globalThis.crypto.randomUUID(), // ← UUID v4
      kind,
      color,
    };
  }
}
