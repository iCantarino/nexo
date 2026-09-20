import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: number;
  tipo: 'cliente' | 'funcionario';
  perfil?: string;
  nome?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; isAdmin: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar sessão do localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<{ success: boolean; isAdmin: boolean; error?: string }> => {
    try {
      // Tentar login como funcionário primeiro
      try {
        const response = await authApi.loginFuncionario(email, senha);
        const { access_token, perfil, nome } = response.data;
        
        const userData: User = {
          id: 0, // Será preenchido ao buscar perfil
          tipo: 'funcionario',
          perfil,
          email,
          nome,
        };

        setToken(access_token);
        setUser(userData);
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true, isAdmin: perfil === 'ADMIN' };
      } catch (funcError: any) {
        // Se não for funcionário, tentar como cliente
        if (funcError.response?.status === 401) {
          const response = await authApi.loginCliente(email, senha);
          const { access_token, perfil, nome } = response.data;
          
          const userData: User = {
            id: 0,
            tipo: 'cliente',
            perfil,
            nome,
          };

          setToken(access_token);
          setUser(userData);
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(userData));

          return { success: true, isAdmin: false };
        }
        throw funcError;
      }
    } catch (error: any) {
      return { 
        success: false, 
        isAdmin: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.perfil === 'ADMIN',
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
