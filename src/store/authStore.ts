/**
 * Authentication store using Zustand
 */

import { create } from 'zustand';
import { AuthResponse, getToken, setToken, removeToken } from '@/lib/api/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
  initAuth: () => void;
}

// Load auth from localStorage on init
const loadAuthFromStorage = (): { user: User | null; token: string | null } => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
      };
    }
  } catch (e) {
    console.error('[AuthStore] Error loading from storage:', e);
  }
  return { user: null, token: null };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  initAuth: () => {
    const { user, token } = loadAuthFromStorage();
    const tokenFromStorage = getToken();
    const finalToken = token || tokenFromStorage;
    
    if (finalToken && user) {
      set({
        user,
        token: finalToken,
        isAuthenticated: true,
      });
    }
  },
  
  setAuth: (authResponse: AuthResponse) => {
    setToken(authResponse.token);
    const authData = {
      user: authResponse.user,
      token: authResponse.token,
      isAuthenticated: true,
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('auth-storage', JSON.stringify(authData));
    } catch (e) {
      console.error('[AuthStore] Error saving to storage:', e);
    }
    
    set(authData);
  },
  
  clearAuth: () => {
    removeToken();
    try {
      localStorage.removeItem('auth-storage');
    } catch (e) {
      console.error('[AuthStore] Error clearing storage:', e);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  checkAuth: () => {
    const token = getToken();
    const { user } = get();
    const isAuth = !!token && !!user;
    set({ isAuthenticated: isAuth, token: token || null });
    return isAuth;
  },
}));

// Initialize auth on module load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initAuth();
}

