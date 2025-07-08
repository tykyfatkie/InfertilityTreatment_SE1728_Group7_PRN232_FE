import { getToken } from '../utils/auth';

const API_BASE_URL = '/api';

// Hàm helper để tạo request với token
const createRequest = (method: string, body?: any): RequestInit => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
};

// Hàm helper để xử lý response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// API Authentication
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, 
      createRequest('POST', credentials)
    );
    return handleResponse(response);
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, 
      createRequest('POST', userData)
    );
    return handleResponse(response);
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, 
      createRequest('POST')
    );
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, 
      createRequest('POST')
    );
    return handleResponse(response);
  },
};

// API User
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, 
      createRequest('GET')
    );
    return handleResponse(response);
  },

  updateProfile: async (userData: Partial<{ name: string; email: string }>) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, 
      createRequest('PUT', userData)
    );
    return handleResponse(response);
  },
};

// Generic API caller
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : endpoint;
  
  const defaultOptions = createRequest(options.method || 'GET', 
    options.body ? JSON.parse(options.body as string) : undefined
  );
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  const response = await fetch(url, mergedOptions);
  return handleResponse(response);
};