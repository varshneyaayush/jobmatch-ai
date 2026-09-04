import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfileResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfileResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoLogin: (role: 'job_seeker' | 'recruiter' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('jobmatch_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.auth.getMe();
      setUser(me);
    } catch (err) {
      console.error('Failed to load authenticated user:', err);
      localStorage.removeItem('jobmatch_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('jobmatch_token', token);
    setUser(userData as UserProfileResponse);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('jobmatch_token');
    setUser(null);
  };

  const demoLogin = async (role: 'job_seeker' | 'recruiter' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.auth.demoLogin(role);
      localStorage.setItem('jobmatch_token', res.access_token);
      await refreshUser();
    } catch (err) {
      console.error('Demo login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
