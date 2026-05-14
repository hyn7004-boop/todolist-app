import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

const mockSignupResponse = {
  user_id: 'u1',
  email: 'test@example.com',
  name: '홍길동',
  created_at: '2026-05-13T10:00:00.000Z',
};

const mockLoginResponse = {
  token: 'jwt-token-abc',
  user: { user_id: 'u1', email: 'test@example.com', name: '홍길동' },
};

describe('authApi', () => {
  let mock: MockAdapter;

  beforeEach(async () => {
    const { default: apiClient } = await import('../api/client');
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('signup', () => {
    it('성공 시 SignupResponse를 반환한다', async () => {
      mock.onPost('/auth/signup').reply(201, { success: true, data: mockSignupResponse });
      const { signup } = await import('../api/authApi');

      const result = await signup({ email: 'test@example.com', password: 'pass1234', name: '홍길동' });

      expect(result.user_id).toBe('u1');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('홍길동');
    });

    it('요청 body에 이메일, 비밀번호, 이름이 포함된다', async () => {
      mock.onPost('/auth/signup').reply(201, { success: true, data: mockSignupResponse });
      const { signup } = await import('../api/authApi');

      await signup({ email: 'test@example.com', password: 'pass1234', name: '홍길동' });

      const requestBody = JSON.parse(mock.history.post[0].data as string);
      expect(requestBody.email).toBe('test@example.com');
      expect(requestBody.password).toBe('pass1234');
      expect(requestBody.name).toBe('홍길동');
    });

    it('400 에러 시 reject된다', async () => {
      mock.onPost('/auth/signup').reply(400, {
        success: false,
        error: { code: 'INVALID_PASSWORD', message: '비밀번호 정책 위반' },
      });
      const { signup } = await import('../api/authApi');

      await expect(signup({ email: 'test@example.com', password: 'weak', name: '홍길동' })).rejects.toBeDefined();
    });

    it('409 이메일 중복 에러 시 reject된다', async () => {
      mock.onPost('/auth/signup').reply(409, {
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일' },
      });
      const { signup } = await import('../api/authApi');

      await expect(signup({ email: 'dup@example.com', password: 'pass1234', name: '홍길동' })).rejects.toBeDefined();
    });
  });

  describe('login', () => {
    it('성공 시 token과 user를 반환한다', async () => {
      mock.onPost('/auth/login').reply(200, { success: true, data: mockLoginResponse });
      const { login } = await import('../api/authApi');

      const result = await login({ email: 'test@example.com', password: 'pass1234' });

      expect(result.token).toBe('jwt-token-abc');
      expect(result.user.email).toBe('test@example.com');
    });

    it('요청 body에 이메일과 비밀번호가 포함된다', async () => {
      mock.onPost('/auth/login').reply(200, { success: true, data: mockLoginResponse });
      const { login } = await import('../api/authApi');

      await login({ email: 'test@example.com', password: 'pass1234' });

      const requestBody = JSON.parse(mock.history.post[0].data as string);
      expect(requestBody.email).toBe('test@example.com');
      expect(requestBody.password).toBe('pass1234');
    });

    it('401 에러 시 reject된다', async () => {
      mock.onPost('/auth/login').reply(401, {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '자격증명 불일치' },
      });
      const { login } = await import('../api/authApi');

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toBeDefined();
    });
  });

  describe('logout', () => {
    it('성공 시 null을 반환한다', async () => {
      mock.onPost('/auth/logout').reply(200, { success: true, data: null });
      const { logout } = await import('../api/authApi');

      const result = await logout();

      expect(result).toBeNull();
    });

    it('POST /auth/logout 엔드포인트로 요청한다', async () => {
      mock.onPost('/auth/logout').reply(200, { success: true, data: null });
      const { logout } = await import('../api/authApi');

      await logout();

      expect(mock.history.post[0].url).toBe('/auth/logout');
    });

    it('500 에러 시 reject된다', async () => {
      mock.onPost('/auth/logout').reply(500, {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류' },
      });
      const { logout } = await import('../api/authApi');

      await expect(logout()).rejects.toBeDefined();
    });
  });
});
