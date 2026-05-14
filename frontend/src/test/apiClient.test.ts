import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { useAuthStore } from '../stores/authStore';

const mockUser = { user_id: 'u1', email: 'test@example.com', name: 'Test User' };

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient interceptors', () => {
  it('token이 있을 때 Authorization 헤더 첨부', async () => {
    const { default: apiClient } = await import('../api/client');
    const mock = new MockAdapter(apiClient);
    mock.onGet('/test').reply(200, {});

    useAuthStore.getState().login('tok_test', mockUser);

    const response = await apiClient.get('/test');
    const sentHeaders = response.config.headers as Record<string, string>;
    expect(sentHeaders['Authorization']).toBe('Bearer tok_test');

    mock.restore();
  });

  it('token이 없을 때 Authorization 헤더 미첨부', async () => {
    const { default: apiClient } = await import('../api/client');
    const mock = new MockAdapter(apiClient);
    mock.onGet('/test').reply(200, {});

    const response = await apiClient.get('/test');
    const sentHeaders = response.config.headers as Record<string, string>;
    expect(sentHeaders['Authorization']).toBeUndefined();

    mock.restore();
  });

  it('401 응답 시 logout 호출 및 /login 리다이렉트', async () => {
    const { default: apiClient } = await import('../api/client');
    const mock = new MockAdapter(apiClient);
    mock.onGet('/protected').reply(401);

    useAuthStore.getState().login('tok_expired', mockUser);

    let capturedHref = '';
    vi.stubGlobal('window', {
      ...window,
      location: { href: '' },
    });
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    await apiClient.get('/protected').catch(() => null);

    expect(useAuthStore.getState().isLoggedIn).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    void capturedHref;

    mock.restore();
  });
});
