import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';

import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    try {
      const { user: updatedUser } = await authService.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      const response = await authService.uploadAvatar(file);
      const updatedUser = { ...user, avatar: response.avatarUrl };
      setUser(updatedUser);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword({ currentPassword, newPassword });
    } catch (err) {
      console.error('Error changing password:', err);
      throw err;
    }
  };

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
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
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({ name, email, password });
      setUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    updateUser,
    uploadAvatar,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};