import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import axios from 'axios';

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
      const response = await axios.post<{ token: string }>('http://localhost:4000/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      
      // Armazenar token para uso nas requisições autenticadas
      localStorage.setItem('platai-token', token);
      
      // Criar usuário a partir do email (em produção, a API retornaria dados do usuário)
      const userFromEmail: User = {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'partner' as UserRole,
      };
      
      setUser(userFromEmail);
      return true;
    } catch (error) {
      console.error('Login error:', error);
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
