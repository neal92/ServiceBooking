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
    
    // Écouter les changements de localStorage depuis d'autres composants
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user' && event.newValue) {
        try {
          const updatedUser = JSON.parse(event.newValue);
          setUser(updatedUser);
          console.log('Utilisateur mis à jour depuis localStorage:', { 
            ...updatedUser, 
            avatar: updatedUser.avatar ? 'présent' : 'absent' 
          });
        } catch (err) {
          console.error('Erreur lors du parsing des données utilisateur:', err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Effect to log user data and check avatar on mount
  useEffect(() => {
    if (user && user.avatar) {
      console.log('Vérification de l\'avatar au chargement:', user.avatar);
      
      // Tester si l'avatar est accessible
      const img = new Image();
      img.onload = () => console.log('Avatar chargé avec succès!');
      img.onerror = (err) => console.error('Erreur de chargement de l\'avatar:', err);
      
      // Préfixer l'URL si nécessaire
      if (user.avatar.startsWith('/avatars/') || user.avatar.startsWith('/uploads/')) {
        img.src = `http://localhost:5000${user.avatar}`;
      } else {
        img.src = user.avatar;
      }
    }
  }, [user?.avatar]);

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
  };  // Update user profile
  const updateUser = async (data: { firstName?: string; lastName?: string; email?: string; avatar?: string; isPresetAvatar?: boolean }) => {
    setLoading(true);
    setError(null);
    
    console.log('Mise à jour du profil avec les données:', {
      ...data,
      avatar: data.avatar ? 'présent' : 'absent'
    });
    
    try {
      const response = await authService.updateProfile(data);
      console.log('Profil mis à jour, réponse reçue:', {
        ...response.user,
        avatar: response.user.avatar ? 'présent' : 'absent'
      });
      
      // Mettre à jour l'état utilisateur
      setUser(response.user);
      
      // Mettre à jour l'utilisateur dans le localStorage et déclencher un événement
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Créer et dispatcher un événement de stockage pour informer les autres composants
      const event = new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(response.user)
      });
      window.dispatchEvent(event);
      
      console.log('Données utilisateur mises à jour dans le localStorage et événement dispatché');
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
  };  // Upload avatar
  const uploadAvatar = async (file: File) => {
    setLoading(true);
    setError(null);
    
    console.log('Début upload avatar:', { 
      nom: file.name,
      type: file.type,
      taille: file.size
    });
    
    try {
      const response = await authService.uploadAvatar(file);
      console.log('Upload réussi, URL reçue:', response.avatarUrl);
      
      if (user) {
        const updatedUser = { 
          ...user, 
          avatar: response.avatarUrl,
          isPresetAvatar: file.name.match(/^avatar\d+\.svg$/) ? true : false
        };
        
        // Mettre à jour l'état utilisateur
        setUser(updatedUser);
        
        // Mettre à jour l'utilisateur dans le localStorage et déclencher un événement
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Créer et dispatcher un événement de stockage pour informer les autres composants
        const event = new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser)
        });
        window.dispatchEvent(event);
        
        console.log('Données utilisateur mises à jour dans le localStorage avec le nouvel avatar et événement dispatché');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'upload de l'avatar.");
      console.error('Erreur lors de l\'upload de l\'avatar:', err);
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