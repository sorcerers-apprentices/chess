import type {
  NotationLetter,
  NotationSquare,
} from '@/app/types/chess-type/chess-square.type';

export function isNotationSquare(value: string): value is NotationSquare {
  if (value.length !== 2) return false;

  const file: string = value[0];
  const rank: string = value[1];

  return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
}

export function parseUci(uci: string): {
  from: NotationSquare;
  to: NotationSquare;
} {
  const from: string = uci.slice(0, 2);
  const to: string = uci.slice(2, 4);

  if (!isNotationSquare(from) || !isNotationSquare(to)) {
    throw new Error(`Invalid UCI: ${uci}`);
  }

  return { from, to };
}

function stripSanSuffixes(san: string): string {
  // убираем + и # на конце (O-O+, O-O-O#)
  return san.replace(/[+#]+$/g, '');
}

export function isKingsideCastleBySan(san: string): boolean {
  return stripSanSuffixes(san) === 'O-O';
}

export function isQueensideCastleBySan(san: string): boolean {
  return stripSanSuffixes(san) === 'O-O-O';
}

export function isBigPawnMove(
  piece: NotationLetter,
  from: NotationSquare,
  to: NotationSquare,
): boolean {
  if (piece !== 'p') return false;
  if (from[0] !== to[0]) return false; // file должен совпадать
  const fromRank = Number(from[1]);
  const toRank = Number(to[1]);
  return Math.abs(fromRank - toRank) === 2;
}

// Проверяем, есть ли фигура на клетке в fen_before.
// Нам нужно только "пусто/не пусто", тип фигуры не важен.
export function hasPieceAtSquare(fen: string, square: NotationSquare): boolean {
  const placement = fen.split(' ')[0];
  const ranks = placement.split('/'); // 8 -> 1

  const fileIndex = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0..7
  const rank = Number(square[1]); // 1..8
  const fenRankIndex = 8 - rank; // rank 8 -> 0

  const row = ranks[fenRankIndex];
  let col = 0;

  for (const ch of row) {
    if (ch >= '1' && ch <= '8') {
      col += Number(ch);
      continue;
    }
    if (col === fileIndex) return true;
    col += 1;
  }

  return false;
}

export function isEnPassantFromRow(
  piece: NotationLetter,
  captured: NotationLetter | null,
  from: NotationSquare,
  to: NotationSquare,
  fenBefore: string,
): boolean {
  if (piece !== 'p') return false;
  if (captured !== 'p') return false;

  // пешка идёт по диагонали на 1
  const fileDiff = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
  const rankDiff = Math.abs(Number(from[1]) - Number(to[1]));
  if (fileDiff !== 1 || rankDiff !== 1) return false;

  // ключ: в fen_before на клетке "to" должно быть пусто (взятие мимоходом)
  return !hasPieceAtSquare(fenBefore, to);
}
