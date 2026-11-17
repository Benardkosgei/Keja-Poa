import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { User, AuthTokens, UserRole } from '@/types';
import { authApi } from '@/services/api';

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  /** True only until the stored session has been validated on mount. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm?: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Decode the JWT exp claim — returns true if the token expires within 60 s. */
function isTokenExpiredOrExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; give a 60-second buffer
    return payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  // Prevents concurrent refresh attempts
  const refreshingRef = useRef(false);

  // ── Fix #34: validate token expiry on mount ──────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = readStorage<User>('kejapoa_user');
      const storedTokens = readStorage<AuthTokens>('kejapoa_tokens');

      if (!storedUser || !storedTokens) {
        setLoading(false);
        return;
      }

      // If the access token is still valid, use it directly
      if (!isTokenExpiredOrExpiringSoon(storedTokens.access)) {
        setUser(storedUser);
        setTokens(storedTokens);
        setLoading(false);
        return;
      }

      // Try to silently refresh
      try {
        const refreshed = await authApi.refresh(storedTokens.refresh);
        const newTokens: AuthTokens = { ...storedTokens, access: refreshed.access };
        setUser(storedUser);
        setTokens(newTokens);
        localStorage.setItem('kejapoa_tokens', JSON.stringify(newTokens));
      } catch {
        // Refresh token also expired — clear session
        localStorage.removeItem('kejapoa_user');
        localStorage.removeItem('kejapoa_tokens');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ── Fix #9 (web): proactive token refresh ─────────────────────────────────
  // Re-check every 5 minutes; refresh if the access token expires within 60 s.
  useEffect(() => {
    const interval = setInterval(async () => {
      const storedTokens = readStorage<AuthTokens>('kejapoa_tokens');
      if (!storedTokens || refreshingRef.current) return;
      if (!isTokenExpiredOrExpiringSoon(storedTokens.access)) return;

      refreshingRef.current = true;
      try {
        const refreshed = await authApi.refresh(storedTokens.refresh);
        const newTokens: AuthTokens = { ...storedTokens, access: refreshed.access };
        setTokens(newTokens);
        localStorage.setItem('kejapoa_tokens', JSON.stringify(newTokens));
      } catch {
        // Refresh failed — log the user out
        setUser(null);
        setTokens(null);
        localStorage.removeItem('kejapoa_user');
        localStorage.removeItem('kejapoa_tokens');
      } finally {
        refreshingRef.current = false;
      }
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const persistSession = useCallback((u: User, t: AuthTokens) => {
    setUser(u);
    setTokens(t);
    localStorage.setItem('kejapoa_user', JSON.stringify(u));
    localStorage.setItem('kejapoa_tokens', JSON.stringify(t));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    persistSession(response.user, response.tokens);
  }, [persistSession]);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register({
      ...data,
      password_confirm: data.password_confirm ?? data.password,
    });
    persistSession(response.user, response.tokens);
  }, [persistSession]);

  // ── Fix #8 (web): call server logout to blacklist the refresh token ────────
  const logout = useCallback(async () => {
    const storedTokens = readStorage<AuthTokens>('kejapoa_tokens');
    if (storedTokens?.refresh) {
      try {
        await authApi.logout(storedTokens.refresh);
      } catch {
        // Ignore — clear local session regardless
      }
    }
    setUser(null);
    setTokens(null);
    localStorage.removeItem('kejapoa_user');
    localStorage.removeItem('kejapoa_tokens');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('kejapoa_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user && !!tokens,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Theme Context ────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    document.documentElement.classList.toggle('dark');
  }, []);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Toast Context ────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export type { AuthContextType, ThemeContextType, ToastContextType };
