import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, LoginCredentials, User } from '../types/auth';
import { 
  setToken, 
  getToken, 
  removeToken, 
  getUserFromToken, 
  isAuthenticated as checkAuth 
} from '../utils/auth';
import { authAPI } from '../services/api'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = getToken();
      if (storedToken && checkAuth()) {
        setTokenState(storedToken);
        const userData = getUserFromToken(storedToken);
        setUser(userData);
      } else {
        // Token hết hạn hoặc không hợp lệ
        removeToken();
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const data = await authAPI.login(credentials);
      const { token: newToken } = data;

      // Lưu token và decode user info
      setToken(newToken);
      setTokenState(newToken);
      const userData = getUserFromToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Gọi API logout (optional)
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Luôn luôn clear local state
      removeToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};