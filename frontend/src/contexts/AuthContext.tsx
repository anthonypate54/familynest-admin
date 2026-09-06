import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import axios from 'axios';

// Types
interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Keep a ref in sync with the latest token so the interceptor below (which
  // is only ever registered ONCE) always reads the current value instead of
  // a stale one captured in its closure.
  const tokenRef = useRef<string | null>(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Setup axios interceptors exactly once. Previously this ran on every
  // `token` change and registered a NEW interceptor each time without ever
  // ejecting the old one, so they piled up across login/logout cycles.
  // Axios runs request interceptors in *reverse* (LIFO) order, so an older,
  // stale interceptor could end up running last and "winning" - attaching an
  // old token to requests after logging in as a different admin. Registering
  // once and reading from a ref avoids both the pile-up and that ordering bug.
  useEffect(() => {
    const requestInterceptorId = api.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }
      return config;
    });

    const responseInterceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptorId);
      api.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  // Verify token on app start
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setAdmin(response.data.admin);
        console.log('✅ Admin session restored:', response.data.admin.email);
      } catch (error) {
        console.log('❌ Token verification failed:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting admin login for:', email);

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token: newToken, admin: adminData } = response.data;
      
      // Store token and admin data
      setToken(newToken);
      setAdmin(adminData);
      localStorage.setItem('adminToken', newToken);
      
      console.log('✅ Admin login successful:', adminData.email);
      return true;
    } catch (error: any) {
      console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
      
      // Clear any existing auth data
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Admin logout');
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
  };

  const value: AuthContextType = {
    admin,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export axios instance for use in other components
export { api };











