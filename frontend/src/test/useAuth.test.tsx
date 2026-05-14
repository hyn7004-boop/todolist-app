import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';

const mockUser = { user_id: 'u1', email: 'test@example.com', name: 'Test User' };

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, isLoggedIn: false });
});

describe('useAuth', () => {
  it('초기 상태 반환', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('login 호출 후 상태 변화', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.login('tok_xyz', mockUser);
    });
    expect(result.current.token).toBe('tok_xyz');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('logout 호출 후 상태 초기화', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.login('tok_xyz', mockUser);
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });
});
