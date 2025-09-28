import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';

import type { AuthService as AuthServiceType } from './auth.service';

// ---- type-only imports (чтобы не триггерить выполнение модулей) ----
import type {
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from '@supabase/supabase-js';

// ---- моки модулей ДО импорта сервиса ----
jest.unstable_mockModule('@/environments/environment.development', () => ({
  environment: {
    apiUrl: 'https://fake.supabase.co',
    publishableKey: 'pk_test_fake',
    redirectURL: 'http://localhost:4200/signin',
  },
}));

// типы функций SDK
type SignUpFn = (c: SignUpWithPasswordCredentials) => Promise<AuthResponse>;

type SignInFn = (
  c: SignInWithPasswordCredentials,
) => Promise<AuthTokenResponsePassword>;

// МОКИ — без дженериков у jest.fn, тип на переменной
const signUpMock: jest.MockedFunction<SignUpFn> = jest.fn();
const signInWithPasswordMock: jest.MockedFunction<SignInFn> = jest.fn();

jest.unstable_mockModule('@supabase/supabase-js', () => {
  const createClient = jest.fn(() => ({
    auth: {
      signUp: signUpMock,
      signInWithPassword: signInWithPasswordMock,
    },
  }));

  // локальный класс ошибки с явными модификаторами (ESLint)
  class AuthError extends Error {
    public status: number;
    public code: string | undefined;

    constructor(message: string, status: number, code?: string) {
      super(message);
      this.status = status;
      this.code = code;
      this.name = 'AuthError';
    }
  }

  return { createClient, AuthError };
});

// теперь можно динамически импортировать значения
const { AuthService } = await import('./auth.service');
const { AuthError } = await import('@supabase/supabase-js');

// ---- localStorage.getItem spy ----
const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

describe('AuthService', () => {
  let service: AuthServiceType;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('возвращает успешный AuthResponse как есть', async () => {
      const supabaseOk: AuthResponse = {
        data: { user: null, session: null },
        error: null,
      };
      signUpMock.mockResolvedValueOnce(supabaseOk);

      const res = await service.signup({
        email: 'a@b.c',
        password: 'Secret#123',
        displayName: 'Alice',
        phone: '+359888000111',
      });

      expect(signUpMock).toHaveBeenCalledWith({
        email: 'a@b.c',
        password: 'Secret#123',
        options: {
          data: { display_name: 'Alice', phone: '+359888000111' },
          emailRedirectTo: 'http://localhost:4200/signin',
        },
      });
      expect(res).toEqual(supabaseOk);
      expect(res.error).toBeNull();
    });

    it('пробрасывает ошибочный AuthResponse от Supabase', async () => {
      const supabaseErr: AuthResponse = {
        data: { user: null, session: null },
        error: new AuthError('Email already used', 400, 'email_exists'),
      };
      signUpMock.mockResolvedValueOnce(supabaseErr);

      const res = await service.signup({
        email: 'x@x.x',
        password: '123',
        displayName: '',
        phone: '',
      });

      expect(res.error).toBeInstanceOf(AuthError);
      expect(res.error?.message).toBe('Email already used');
      expect((res.error as InstanceType<typeof AuthError>).status).toBe(400);
    });
  });

  describe('signin', () => {
    it('возвращает успешный AuthTokenResponsePassword как есть', async () => {
      const ok: AuthTokenResponsePassword = {
        data: {
          user: {} as unknown as User,
          session: {} as unknown as Session,
        },
        error: null,
      };
      signInWithPasswordMock.mockResolvedValueOnce(ok);

      const res = await service.signin({
        email: 'user@site.com',
        password: 'Pa$$w0rd',
      });

      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: 'user@site.com',
        password: 'Pa$$w0rd',
      });
      expect(res).toEqual(ok);
      expect(res.error).toBeNull();
    });

    it('пробрасывает ошибочный AuthTokenResponsePassword', async () => {
      const err: AuthTokenResponsePassword = {
        data: { user: null, session: null },
        error: new AuthError('Invalid login', 400, 'invalid_credentials'),
      };
      signInWithPasswordMock.mockResolvedValueOnce(err);

      const res = await service.signin({
        email: 'bad@user',
        password: 'wrong',
      });

      expect(res.error).toBeInstanceOf(AuthError);
      expect(res.error?.message).toBe('Invalid login');
      expect((res.error as InstanceType<typeof AuthError>).status).toBe(400);
    });
  });

  describe('getUserData', () => {
    it('возвращает распарсенный объект, если в localStorage валидный JSON', () => {
      const payload = { id: 'u42', email: 'user@site.com' };
      getItemSpy.mockReturnValueOnce(JSON.stringify(payload));

      const res = service.getUserData();

      expect(res).toEqual(payload);
    });

    it('возвращает пустой объект, если ключа нет', () => {
      getItemSpy.mockReturnValueOnce(null);

      const res = service.getUserData();

      expect(res).toEqual({});
    });

    it('бросает SyntaxError при битом JSON (текущее поведение сервиса)', () => {
      getItemSpy.mockReturnValueOnce('{bad json');

      expect(() => service.getUserData()).toThrow(SyntaxError);
    });
  });
});
