import { create } from 'zustand';
import type { AuthState, AuthUser } from '../types/auth.types';

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  login: (token: string, user: AuthUser) => set({ token, user, isLoggedIn: true }),
  logout: () => set({ token: null, user: null, isLoggedIn: false }),
  setUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
}));
