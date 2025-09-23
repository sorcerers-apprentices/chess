import {
  FILES,
  type FileType,
  RANKS,
  type RankType,
} from '@/app/types/chess-square.type';
import type {
  DragDataType,
  DropDataType,
} from '@/app/types/drag-drop-data.type';
import type { Color } from 'chess.js';

const FILES_SET: ReadonlySet<string> = new Set(FILES);
const RANKS_SET: ReadonlySet<number> = new Set(RANKS);

export function isFileType(value: string): value is FileType {
  return FILES_SET.has(value);
}

export function isRankType(value: number): value is RankType {
  return RANKS_SET.has(value);
}

// --- Type guards ---
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isDragData(candidate: unknown): candidate is DragDataType {
  if (!isRecord(candidate)) return false;

  return (
    typeof candidate['fromSquare'] === 'string' &&
    candidate['piece'] !== null &&
    candidate['piece'] !== undefined
  );
}

export function isDropData(candidate: unknown): candidate is DropDataType {
  if (!isRecord(candidate)) return false;

  return typeof candidate['square'] === 'string';
}

export function parseActiveColor(fen: string): Color {
  const token = fen.split(' ')[1];
  if (token === 'w' || token === 'b') {
    return token;
  }
  throw new Error(`Invalid FEN active color: ${token}`);
}
