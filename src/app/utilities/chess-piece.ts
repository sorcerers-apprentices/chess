import {
  FILES,
  type FileType,
  RANKS,
  type RankType,
} from '@/app/types/chess-square.type';

const FILES_SET: ReadonlySet<string> = new Set(FILES);
const RANKS_SET: ReadonlySet<number> = new Set(RANKS);

export function isFileType(value: string): value is FileType {
  return FILES_SET.has(value);
}

export function isRankType(value: number): value is RankType {
  return RANKS_SET.has(value);
}
