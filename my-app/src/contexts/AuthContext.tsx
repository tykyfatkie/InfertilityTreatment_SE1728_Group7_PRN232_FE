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
      // Giả lập API call - thay bằng API thực tế
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
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

  const logout = (): void => {
    removeToken();
    setTokenState(null);
    setUser(null);
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