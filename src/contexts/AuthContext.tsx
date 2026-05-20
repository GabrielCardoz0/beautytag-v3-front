import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface ApiUserResponse {
  user: {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    role: UserRole;
    metadata: Record<string, string> | null;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('platai-user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('platai-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('platai-user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Fazer login e obter token
      const loginResponse = await axios.post<{ token: string }>(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token } = loginResponse.data;
      localStorage.setItem('platai-token', token);

      // 2. Buscar dados completos do usuário
      const userResponse = await axios.get<ApiUserResponse>(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiUser = userResponse.data.user;
      
      // 3. Converter para o formato interno
      const userData: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        metadata: apiUser.metadata,
        confirmed: apiUser.confirmed,
        blocked: apiUser.blocked,
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at,
      };
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('platai-token');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('platai-token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
