import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

const mockUser = { user_id: 'u1', email: 'test@example.com', name: 'Test User' };

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
});

describe('authStore', () => {
  it('초기 상태는 token null, user null, isLoggedIn false', () => {
    const { token, user, isLoggedIn } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isLoggedIn).toBe(false);
  });

  it('login 액션: token과 user 설정, isLoggedIn true', () => {
    useAuthStore.getState().login('tok_abc', mockUser);
    const { token, user, isLoggedIn } = useAuthStore.getState();
    expect(token).toBe('tok_abc');
    expect(user).toEqual(mockUser);
    expect(isLoggedIn).toBe(true);
  });

  it('logout 액션: 상태 초기화', () => {
    useAuthStore.getState().login('tok_abc', mockUser);
    useAuthStore.getState().logout();
    const { token, user, isLoggedIn } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isLoggedIn).toBe(false);
  });

  it('persist 미들웨어 미사용 - localStorage에 저장되지 않음', () => {
    useAuthStore.getState().login('tok_abc', mockUser);
    expect(localStorage.getItem('auth-storage')).toBeNull();
  });

  it('여러 번 login/logout 사이클', () => {
    for (let i = 0; i < 3; i++) {
      useAuthStore.getState().login(`tok_${i}`, mockUser);
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().token).toBe(`tok_${i}`);
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
    }
  });
});
