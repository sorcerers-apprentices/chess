import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('@angular/cdk/drag-drop', () => ({}), { virtual: true });
jest.mock('@angular/cdk/style-loader', () => ({}), { virtual: true });

import { ChessSquare } from '@/app/components/chess-square/chess-square';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type {
  NotationSquare,
  SquareColorType,
} from '@/app/types/chess-type/chess-square.type';
import type { Piece } from 'chess.js';
import { PIECE_ICON_URL } from '@/app/constants/chess-piece.constans';
import type {
  DragDataType,
  DropDataType,
} from '@/app/types/drag-drop-data.type';
import type { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

describe('ChessSquare (standalone, Angular 20)', () => {
  let fixture: ComponentFixture<ChessSquare>;
  let component: ChessSquare;

  const A1 = 'a1' as NotationSquare;
  const A2 = 'a2' as NotationSquare;
  const H8 = 'h8' as NotationSquare;

  const ALL_SQUARES = [A1, A2, H8] as readonly NotationSquare[];

  const whiteQueen: Piece = {
    type: 'q',
    color: 'w',
  };

  const blackPawn: Piece = {
    type: 'pawn' as Piece['type'],
    color: 'black' as Piece['color'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChessSquare], // реальный компонент
    }).compileComponents();

    fixture = TestBed.createComponent(ChessSquare);
    component = fixture.componentInstance;

    // required inputs
    fixture.componentRef.setInput('square', A1);
    fixture.componentRef.setInput(
      'backgroundColor',
      'white' as SquareColorType,
    );
    fixture.componentRef.setInput('allSquares', ALL_SQUARES);

    // detectChanges() не нужен —  не рендерим шаблон
  });

  describe('computed signals', () => {
    it('connectedToIds — содержит все клетки кроме самой', () => {
      expect(component['connectedToIds']()).toEqual([A2, H8]);
    });

    it('icon/altText/hasPiece — при пустой клетке', () => {
      expect(component['icon']()).toBe('');
      expect(component['altText']()).toBe('');
      expect(component['hasPiece']()).toBe(false);
    });

    it('icon/altText/hasPiece — при наличии фигуры', () => {
      fixture.componentRef.setInput('piece', whiteQueen);
      fixture.detectChanges();

      expect(component['hasPiece']()).toBe(true);
      expect(component['altText']()).toBe('w q');

      const expectedUrl = PIECE_ICON_URL[whiteQueen.type][whiteQueen.color];
      expect(component['icon']()).toBe(expectedUrl);
    });

    it('dragData — null если фигуры нет; объект если есть', () => {
      expect(component['dragData']()).toBeNull();

      fixture.componentRef.setInput('piece', whiteQueen);
      fixture.detectChanges();

      expect(component['dragData']()).toEqual({
        piece: whiteQueen,
        fromSquare: A1,
      });
    });

    it('dropData — всегда квадрат+текущая фигура (или null)', () => {
      // без фигуры
      expect(component['dropData']()).toEqual({
        square: A1,
        piece: null,
      });

      // с фигурой
      fixture.componentRef.setInput('piece', whiteQueen);
      fixture.detectChanges();

      expect(component['dropData']()).toEqual({
        square: A1,
        piece: whiteQueen,
      });
    });
  });

  describe('простые эмиттеры (handleDrag*)', () => {
    it('handleDragStart — эмитит текущую клетку', () => {
      const spy: jest.Mock = jest.fn();
      component.dragStartSquare.subscribe(spy);

      component.handleDragStart();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(A1);
    });

    it('handleDragEnter — эмитит текущую клетку', () => {
      const spy: jest.Mock = jest.fn();
      component.dragEnterSquare.subscribe(spy);

      component.handleDragEnter();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(A1);
    });

    it('handleDragEnd — эмитит void', () => {
      const spy: jest.Mock = jest.fn();
      component.dragEndSquare.subscribe(spy);

      component.handleDragEnd();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('canEnter (CDK предикат)', () => {
    const makeDrag = (data: DragDataType): CdkDrag<DragDataType> =>
      ({ data }) as unknown as CdkDrag<DragDataType>;

    const makeDrop = (data: DropDataType): CdkDropList<DropDataType> =>
      ({ data }) as unknown as CdkDropList<DropDataType>;

    it('false — если перетаскиваем в ту же клетку', () => {
      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const drop = makeDrop({ square: A1, piece: null });

      expect(component.canEnter(drag, drop)).toBe(false);
    });

    it('false — если в target своя фигура того же цвета', () => {
      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const drop = makeDrop({
        square: A2,
        piece: { ...whiteQueen },
      });

      expect(component.canEnter(drag, drop)).toBe(false);
    });

    it('true по умолчанию — если allowedTargets или fromSquare ещё не заданы', () => {
      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const drop = makeDrop({ square: A2, piece: null });

      expect(component.canEnter(drag, drop)).toBe(true);
    });

    it('true — если square ∈ allowedTargets И drag.from совпадает с fromSquare', () => {
      fixture.componentRef.setInput(
        'allowedTargets',
        new Set<NotationSquare>([A2, H8]) as ReadonlySet<NotationSquare>,
      );
      fixture.componentRef.setInput('fromSquare', A1);

      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const dropOk = makeDrop({ square: A2, piece: null });

      expect(component.canEnter(drag, dropOk)).toBe(true);
    });

    it('false — если square ∉ allowedTargets даже при корректном from', () => {
      fixture.componentRef.setInput(
        'allowedTargets',
        new Set<NotationSquare>([H8]) as ReadonlySet<NotationSquare>,
      );
      fixture.componentRef.setInput('fromSquare', A1);

      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const dropBad = makeDrop({ square: A2, piece: null });

      expect(component.canEnter(drag, dropBad)).toBe(false);
    });

    it('false — если drag.from ≠ fromSquare (несогласованный источник)', () => {
      fixture.componentRef.setInput(
        'allowedTargets',
        new Set<NotationSquare>([A2]) as ReadonlySet<NotationSquare>,
      );
      fixture.componentRef.setInput('fromSquare', H8);

      const drag = makeDrag({ piece: whiteQueen, fromSquare: A1 });
      const drop = makeDrop({ square: A2, piece: null });

      expect(component.canEnter(drag, drop)).toBe(false);
    });
  });

  describe('onDrop', () => {
    const makeEvent = (
      dragged: DragDataType | unknown,
      target: DropDataType | unknown,
    ): CdkDragDrop<DropDataType, DropDataType, DragDataType> =>
      ({
        item: { data: dragged },
        container: { data: target },
      }) as unknown as CdkDragDrop<DropDataType, DropDataType, DragDataType>;

    it('эмитит chessMove { from, to } при валидном переносе в другую клетку', () => {
      const spy: jest.Mock = jest.fn();
      component.chessMove.subscribe(spy);

      const event = makeEvent(
        { piece: whiteQueen, fromSquare: A1 },
        { square: A2, piece: blackPawn },
      );

      component.onDrop(event);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ from: A1, to: A2 });
    });

    it('игнор — если перетащили в ту же клетку', () => {
      const spy = jest.fn();
      component.chessMove.subscribe(spy);

      const event = makeEvent(
        { piece: whiteQueen, fromSquare: A1 },
        { square: A1, piece: null },
      );

      component.onDrop(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('игнор — если данные не проходят type-guard (невалидные формы)', () => {
      const spy: jest.Mock = jest.fn();
      component.chessMove.subscribe(spy);

      const badDragged = { from: A1 } as unknown;
      const badTarget = { sq: A2 } as unknown;

      const event = makeEvent(badDragged, badTarget);
      component.onDrop(event);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
