import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getAuthToken, removeAuthToken } from '@/lib/api';
import { Admin } from '@/types';

interface AuthContextType {
  user: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token varsa kullanıcı bilgilerini al
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          removeAuthToken();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await authAPI.login(username, password);
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      throw new Error('Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
