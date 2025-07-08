import { jwtDecode } from 'jwt-decode';
import type { DecodedToken, User } from '../types/auth';

// Lưu token vào localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Lấy token từ localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Xóa token khỏi localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Decode JWT token
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Kiểm tra token có hết hạn không
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Lấy user từ token
export const getUserFromToken = (token: string): User | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role
  };
};

// Kiểm tra xem user có đang authenticated không
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};