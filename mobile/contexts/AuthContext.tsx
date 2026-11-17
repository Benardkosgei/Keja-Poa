import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import type { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [userJson, tokensJson] = await Promise.all([
          AsyncStorage.getItem('kejapoa_user'),
          AsyncStorage.getItem('kejapoa_tokens'),
        ]);
        if (userJson && tokensJson) {
          setUser(JSON.parse(userJson));
          setTokens(JSON.parse(tokensJson));
        }
      } catch {
        // Storage read failed — start fresh
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const persistSession = async (u: User, t: AuthTokens) => {
    setUser(u);
    setTokens(t);
    await Promise.all([
      AsyncStorage.setItem('kejapoa_user', JSON.stringify(u)),
      AsyncStorage.setItem('kejapoa_tokens', JSON.stringify(t)),
    ]);
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    await persistSession(response.data.user, response.data.tokens);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data);
    await persistSession(response.data.user, response.data.tokens);
  }, []);

  const logout = useCallback(async () => {
    // Blacklist the refresh token on the server
    if (tokens?.refresh) {
      try {
        await authApi.logout(tokens.refresh);
      } catch { /* ignore — clear locally regardless */ }
    }
    setUser(null);
    setTokens(null);
    await Promise.all([
      AsyncStorage.removeItem('kejapoa_user'),
      AsyncStorage.removeItem('kejapoa_tokens'),
    ]);
  }, [tokens]);

  const updateUser = useCallback(async (updatedUser: User) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('kejapoa_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
