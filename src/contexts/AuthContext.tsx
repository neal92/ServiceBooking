import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import authService from '../services/auth';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { firstName?: string; lastName?: string; email?: string; avatar?: string; isPresetAvatar?: boolean }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login with API
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Register with API
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({ firstName, lastName, email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (data: { firstName?: string; lastName?: string; email?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateProfile(data);
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la mise à jour du profil.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.changePassword({ currentPassword, newPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la modification du mot de passe.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatar: response.avatarUrl });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'upload de l'avatar.");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        changePassword,
        uploadAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};