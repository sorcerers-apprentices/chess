import {
  clone,
  isDragData,
  isDropData,
  isFileType,
  isRankType,
  load,
  parseActiveColor,
} from '@/app/utilities/chess-piece';

describe('chess-piece utils', () => {
  describe('isDragData', () => {
    it('returns true for valid drag data', () => {
      const data = { fromSquare: 'e2', piece: 'P' };
      expect(isDragData(data)).toBe(true);
    });

    it('returns false if fromSquare is missing', () => {
      const data = { piece: 'P' };
      expect(isDragData(data)).toBe(false);
    });

    it('returns false if piece is null', () => {
      const data = { fromSquare: 'e2', piece: null };
      expect(isDragData(data)).toBe(false);
    });
  });

  describe('isDropData', () => {
    it('returns true for valid drop data', () => {
      const data = { square: 'e4' };
      expect(isDropData(data)).toBe(true);
    });

    it('returns false if square is missing', () => {
      const data = { foo: 'bar' };
      expect(isDropData(data)).toBe(false);
    });
  });

  describe('parseActiveColor', () => {
    it('parses white from fen', () => {
      expect(
        parseActiveColor(
          'rn1qkbnr/pppbpppp/8/3p4/3P4/2N1PN2/PPP2PPP/R1BQKB1R w KQkq - 0 5',
        ),
      ).toBe('w');
    });

    it('parses black from fen', () => {
      expect(
        parseActiveColor(
          'rn1qkbnr/pppbpppp/8/3p4/3P4/2N1PN2/PPP2PPP/R1BQKB1R b KQkq - 0 5',
        ),
      ).toBe('b');
    });

    it('throws on invalid fen', () => {
      expect(() => parseActiveColor('invalid fen')).toThrow(
        'Invalid FEN active color',
      );
    });
  });
});

describe('chess-piece utils — extra coverage', () => {
  describe('isDragData — negative branches', () => {
    it('returns false for non-object candidate', () => {
      expect(isDragData(42)).toBe(false);
      expect(isDragData('e2')).toBe(false);
    });

    it('returns false when fromSquare is not a string', () => {
      const data = { fromSquare: 12, piece: 'P' } as unknown;
      expect(isDragData(data)).toBe(false);
    });

    it('returns false when piece is undefined', () => {
      const data = { fromSquare: 'e2', piece: undefined } as unknown;
      expect(isDragData(data)).toBe(false);
    });
  });

  describe('isDropData — negative branches', () => {
    it('returns false for non-object candidate', () => {
      expect(isDropData(null)).toBe(false);
      expect(isDropData(0)).toBe(false);
    });

    it('returns false when square is not a string', () => {
      const data = { square: 123 } as unknown;
      expect(isDropData(data)).toBe(false);
    });
  });

  describe('clone / load', () => {
    const samplePgn =
      '[Event "Casual Game"]\n[Site "Internet"]\n[White "A"]\n[Black "B"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *';

    it('load creates equivalent game (headers + moves)', () => {
      const game = load(samplePgn);

      const pgn = game.pgn();
      expect(pgn).toContain('[White "A"]');
      expect(pgn).toContain('[Black "B"]');

      expect(game.history()).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']);

      expect(game.turn()).toBe('w');

      expect(pgn).toContain('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6');
    });

    it('clone returns a new instance with identical PGN', () => {
      const original = load(samplePgn);
      const copied = clone(original);

      expect(copied).not.toBe(original);
      expect(copied.pgn()).toBe(original.pgn());
    });
  });

  describe('parseActiveColor — extra negative', () => {
    it('throws when token present but not w/b', () => {
      // некорректный токен активного цвета
      const badFen =
        'rn1qkbnr/pppbpppp/8/3p4/3P4/2N1PN2/PPP2PPP/R1BQKB1R x KQkq - 0 5';
      expect(() => parseActiveColor(badFen)).toThrow(
        'Invalid FEN active color',
      );
    });
  });
});

describe('file/rank type guards', () => {
  describe('isFileType', () => {
    it('returns true for valid file letters (a–h)', () => {
      expect(isFileType('a')).toBe(true);
      expect(isFileType('h')).toBe(true);
    });

    it('returns false for invalid file letters', () => {
      expect(isFileType('i')).toBe(false);
      expect(isFileType('')).toBe(false);
      expect(isFileType('1' as unknown as string)).toBe(false);
    });
  });

  describe('isRankType', () => {
    it('returns true for valid ranks (1–8)', () => {
      expect(isRankType(1)).toBe(true);
      expect(isRankType(8)).toBe(true);
    });

    it('returns false for invalid ranks', () => {
      expect(isRankType(0 as unknown as number)).toBe(false);
      expect(isRankType(9 as unknown as number)).toBe(false);
      expect(isRankType(NaN as unknown as number)).toBe(false);
    });
  });
});
