import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, LoginInput, RegisterInput } from '@peerlume/shared';
import { apiService } from '../services/api.js';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check current session from backend on application mount
  const refreshUser = useCallback(async () => {
    try {
      const result = await apiService.auth.getMe();
      if (result.data?.user) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (input: LoginInput): Promise<{ success: boolean; error?: string }> => {
    const result = await apiService.auth.login(input);
    if (result.data?.user) {
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Login failed' };
  };

  const register = async (input: RegisterInput): Promise<{ success: boolean; error?: string }> => {
    const result = await apiService.auth.register(input);
    if (result.data?.user) {
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Registration failed' };
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.auth.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
