import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import authService from '../services/auth';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  pseudo?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    pseudo?: string;
    phone?: string;
    role?: 'user' | 'admin';
  }) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);  // Check for stored user data on mount
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

      // Si le token a été supprimé, déconnecter l'utilisateur
      if (event.key === 'token' && !event.newValue) {
        setUser(null);
        console.log('Token supprimé, utilisateur déconnecté');
      }
    };    // Gestionnaire pour l'événement d'expiration de token
    const handleTokenExpired = (event: CustomEvent) => {
      console.log('Événement d\'expiration de token détecté:', event.detail);

      // Mettre à jour l'état de l'utilisateur immédiatement
      setUser(null);

      // Définir le message d'erreur qui sera affiché dans les composants utilisant useAuth()
      setError(event.detail.message || 'Votre session a expiré. Veuillez vous reconnecter.');

      // Log de débogage pour confirmer la déconnexion
      console.log('Utilisateur déconnecté suite à l\'expiration du token JWT');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-expired', handleTokenExpired as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-expired', handleTokenExpired as EventListener);
    };
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
  };  // Register with API
  const register = async (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    pseudo?: string;
    phone?: string;
    role?: 'user' | 'admin';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (err: any) {
      // Récupérer le message d'erreur de la réponse de l'API ou de l'objet d'erreur
      const errorMessage = err.response?.data?.message || err.message || "Échec de l'inscription. Veuillez réessayer.";
      setError(errorMessage);
      console.error("Erreur lors de l'inscription:", err);
      // Propager l'erreur pour permettre au composant Register de gérer des cas spécifiques
      throw err;
    } finally {
      setLoading(false);
    }
  };// Update user profile
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
      console.log('AuthContext: Tentative de changement de mot de passe');
      const result = await authService.changePassword({ currentPassword, newPassword });
      console.log('AuthContext: Mot de passe changé avec succès', result);
      // Ne pas retourner le résultat pour respecter la signature Promise<void>
    } catch (err: any) {
      console.error('Erreur changement mot de passe dans AuthContext:', err);
      console.error('Type d\'erreur dans AuthContext:', err.constructor.name);
      console.error('Nom d\'erreur dans AuthContext:', err.name);
      console.error('Message d\'erreur dans AuthContext:', err.message);
      console.error('Erreur complète:', err);

      // Préserver l'information de type d'erreur lors de la propagation
      if (err.name === 'IncorrectPasswordError' ||
        (err.message && err.message.includes('Current password is incorrect')) ||
        (err.response?.data?.code === 'INVALID_CURRENT_PASSWORD')) {
        console.log('AuthContext: Détection d\'une erreur de mot de passe incorrect');
        const passwordError = new Error('Current password is incorrect');
        passwordError.name = 'IncorrectPasswordError';
        throw passwordError;
      }

      // Propager l'erreur au composant Profile pour un meilleur traitement
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Upload avatar
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
        // Détermine si c'est un avatar prédéfini
        const isPresetAvatar = file.name.match(/^avatar\d+\.svg$/) ? true : false;

        // Mettre à jour le profil utilisateur complet pour s'assurer que tout est cohérent
        await updateUser({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: response.avatarUrl,
          isPresetAvatar
        });

        // Force un rechargement des données utilisateur depuis le serveur pour s'assurer que tout est à jour
        try {
          const updatedUserData = await authService.getCurrentUser();
          if (updatedUserData) {
            // Mettre à jour l'état utilisateur avec les données les plus récentes
            setUser(updatedUserData);

            // Mettre à jour l'utilisateur dans le localStorage
            localStorage.setItem('user', JSON.stringify(updatedUserData));

            // Dispatcher un événement pour informer les autres composants
            const event = new Event('userUpdated');
            window.dispatchEvent(event);

            console.log('Données utilisateur complètement rafraîchies après changement d\'avatar');
          }
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement des données utilisateur:', refreshError);
        }
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
    console.log('Logout appelé depuis AuthContext');

    // Nettoyer les données d'authentification dans le service auth
    authService.logout();

    // Réinitialiser l'état du contexte
    setUser(null);
    setError(null);

    console.log('Déconnexion effectuée dans AuthContext');
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