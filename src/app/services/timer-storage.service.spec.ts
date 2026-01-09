import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { TimerStorageService } from './timer-storage.service';
import type { PersistShape } from '@/app/types/chess-type/chess-piece.type';

describe('TimerStorageService', () => {
  let service: TimerStorageService;
  const key = 'timer:test';

  beforeEach(() => {
    service = new TimerStorageService();
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('read()', () => {
    it('возвращает null, если ключ отсутствует', () => {
      expect(service.read(key)).toBeNull();
    });

    it('возвращает null, если значение пустая строка', () => {
      localStorage.setItem(key, '');
      expect(service.read(key)).toBeNull();
    });

    it('возвращает корректный объект, если данные валидны', () => {
      const shape: PersistShape = { elapsedMs: 1500, since: 123456789 };
      localStorage.setItem(key, JSON.stringify(shape));

      const result = service.read(key);

      expect(result).toEqual(shape);
    });

    it('возвращает null, если JSON некорректен', () => {
      localStorage.setItem(key, '{ invalid json }');
      expect(service.read(key)).toBeNull();
    });

    it('возвращает null, если поле "since" имеет неверный тип', () => {
      const invalid = { elapsedMs: 100, since: 'oops' };
      localStorage.setItem(key, JSON.stringify(invalid));

      expect(service.read(key)).toBeNull();
    });

    it('разрешает "since" = null', () => {
      const shape: PersistShape = { elapsedMs: 500, since: null };
      localStorage.setItem(key, JSON.stringify(shape));

      const result = service.read(key);

      expect(result).toEqual(shape);
    });
  });

  describe('write()', () => {
    it('сохраняет корректный JSON в localStorage', () => {
      const shape: PersistShape = { elapsedMs: 321, since: 111 };
      const spy = jest.spyOn(Storage.prototype, 'setItem');

      service.write(key, shape);

      expect(spy).toHaveBeenCalledWith(key, JSON.stringify(shape));

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored as string)).toEqual(shape);
    });

    it('не выбрасывает ошибку при недоступном localStorage', () => {
      const shape: PersistShape = { elapsedMs: 10, since: null };
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(() => service.write(key, shape)).not.toThrow();
    });
  });

  describe('clear()', () => {
    it('удаляет элемент из localStorage', () => {
      localStorage.setItem(key, JSON.stringify({ elapsedMs: 1, since: 1 }));
      const spy = jest.spyOn(Storage.prototype, 'removeItem');

      service.clear(key);

      expect(spy).toHaveBeenCalledWith(key);
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('не выбрасывает ошибку при недоступном localStorage', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(() => service.clear(key)).not.toThrow();
    });
  });
});
