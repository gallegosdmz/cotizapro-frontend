import { create } from 'zustand';
import type { AuthResponse, User } from '@/types';
import { authApi } from '@/lib/api/auth.api';
import { usersApi } from '@/lib/api/users.api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User) => void;
}

function saveAuth(res: AuthResponse) {
  localStorage.setItem('token', res.token);
  localStorage.setItem('user', JSON.stringify(res));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    saveAuth(res);
    set({ token: res.token, isAuthenticated: true });
    // Fetch full user profile with role/tenant
    const user = await usersApi.me();
    set({ user });
  },

  register: async (data) => {
    const res = await authApi.register(data);
    saveAuth(res);
    set({ token: res.token, isAuthenticated: true });
    const user = await usersApi.me();
    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },

  refresh: async () => {
    const res = await authApi.refresh();
    saveAuth(res);
    set({ token: res.token, isAuthenticated: true });
    const user = await usersApi.me();
    set({ user });
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ token });
    try {
      const res = await authApi.refresh();
      saveAuth(res);
      const user = await usersApi.me();
      set({ token: res.token, user, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuth();
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
