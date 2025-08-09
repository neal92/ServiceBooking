import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import authService from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    pseudo?: string;
    role?: 'user' | 'admin';
  }) => Promise<any>;
  logout: () => void;
  updateUser: (data: { firstName?: string; lastName?: string; email?: string; pseudo?: string; avatar?: string; isPresetAvatar?: boolean; avatarColor?: string; avatarInitials?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour rafraîchir les données de l'utilisateur
  const refreshUserData = useCallback(async () => {
    try {
      console.log("Rafraîchissement des données utilisateur...");
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("Pas de token, impossible de rafraîchir les données utilisateur");
        return;
      }

      const userData = await authService.getCurrentUser();
      if (userData) {
        console.log("Données utilisateur rafraîchies avec succès:", {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        });

        // Mettre à jour l'état et le localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données utilisateur:", error);
    }
  }, []);  // Pas de dépendances car on utilise des valeurs depuis localStorage et setUser est stable  // Check for stored user data on mount
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
  // Fonction pour extraire les métadonnées d'un avatar SVG
  const extractSvgMetadata = async (svgUrl: string): Promise<{ color?: string, initials?: string }> => {
    try {
      // Préfixer l'URL si nécessaire
      let fullUrl = svgUrl;
      if (svgUrl.startsWith('/avatars/') || svgUrl.startsWith('/uploads/')) {
        fullUrl = `http://localhost:5000${svgUrl}`;
      }

      // Récupérer le contenu SVG
      const response = await fetch(fullUrl);
      const svgContent = await response.text();      // Extraire la couleur des métadonnées
      const colorMatch = svgContent.match(/<metadata>\s*<color>(.*?)<\/color>\s*<\/metadata>/);
      const color = colorMatch ? colorMatch[1] : undefined;

      // Extraire les initiales du texte SVG
      const initialsMatch = svgContent.match(/<text.*?>([^<]+)<\/text>/s);
      const initials = initialsMatch ? initialsMatch[1].trim() : undefined;

      return { color, initials };
    } catch (err) {
      console.error('Erreur lors de l\'extraction des métadonnées SVG:', err);
      return {};
    }
  };

  // Effect to log user data and check avatar on mount
  useEffect(() => {
    if (user && user.avatar) {
      console.log('Vérification de l\'avatar au chargement:', user.avatar);

      // Tester si l'avatar est accessible
      const img = new Image();
      img.onload = () => {
        console.log('Avatar chargé avec succès!');

        // Si c'est un avatar personnalisé (SVG dans uploads), extraire les métadonnées
        if (user.avatar?.startsWith('/uploads/') && user.avatar?.endsWith('.svg')) {
          extractSvgMetadata(user.avatar).then(metadata => {
            if (metadata.color || metadata.initials) {
              setUser(prevUser => {
                if (!prevUser) return prevUser;

                const updatedUser = {
                  ...prevUser,
                  avatarColor: metadata.color,
                  avatarInitials: metadata.initials
                };

                // Mettre à jour également dans le localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));

                console.log('Métadonnées extraites et appliquées:', metadata);
                return updatedUser;
              });
            }
          });
        }
      };
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
      console.log("Tentative de connexion avec email:", email);
      
      // Vider les données précédentes d'authentification pour éviter les conflits
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log("Données d'authentification précédentes effacées");
      
      const response = await authService.login({ email, password });

      if (!response || !response.token) {
        console.error("Réponse de connexion invalide - token manquant:", response);
        throw new Error("Le serveur n'a pas fourni de token d'authentification");
      }

      // Vérifier les données de l'utilisateur avant de les stocker
      console.log("Connexion réussie, données utilisateur:", {
        id: response.user?.id,
        email: response.user?.email,
        firstName: response.user?.firstName,
        lastName: response.user?.lastName,
        role: response.user?.role,
        pseudo: response.user?.pseudo
      });

      // S'assurer que toutes les données nécessaires sont présentes
      if (!response.user || !response.user.id || !response.user.email) {
        console.error("Données utilisateur incomplètes reçues lors de la connexion");

        // Tenter de récupérer l'utilisateur complet si les données sont incomplètes
        try {
          console.log("Tentative de récupération des données complètes de l'utilisateur");
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log("Utilisateur complet récupéré:", currentUser);
            // Mettre à jour l'utilisateur avec les données complètes
            localStorage.setItem('user', JSON.stringify(currentUser));
            setUser(currentUser);
          } else {
            console.error("Impossible de récupérer les données complètes de l'utilisateur");
            setUser(response.user);
          }
        } catch (fetchError) {
          console.error("Erreur lors de la récupération des données complètes:", fetchError);
          // Utiliser les données reçues même si incomplètes
          setUser(response.user);
        }
      } else {
        // Les données sont complètes, les utiliser directement
        setUser(response.user);
      }
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
    role?: 'user' | 'admin';
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Tentative d'inscription avec:", {
        ...userData,
        password: "****" // Masquer le mot de passe dans les logs
      });

      const response = await authService.register(userData);
      console.log("Inscription réussie, utilisateur:", response.user);

      // Vérifier que nous avons bien un utilisateur et un token
      if (!response.user || !response.token) {
        throw new Error("Données d'authentification incomplètes après inscription");
      }

      // Stocker le token et l'utilisateur dans localStorage, comme dans la fonction login
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Token et utilisateur stockés dans localStorage après inscription');

      // Vérifier les données avant de mettre à jour l'état
      console.log("Données de l'utilisateur après inscription:", {
        id: response.user?.id,
        email: response.user?.email,
        firstName: response.user?.firstName,
        role: response.user?.role
      });

      // Mettre à jour l'état de l'utilisateur immédiatement
      setUser(response.user);
      console.log("État user mis à jour dans le contexte:", response.user ? "présent" : "absent");

      // Créer et dispatcher un événement de stockage pour informer les autres composants
      const event = new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(response.user)
      });
      window.dispatchEvent(event);
      console.log('Événement de stockage dispatché pour informer les autres composants');

      // Log pour vérifier l'état du localStorage après l'inscription
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('Vérification localStorage après 500ms:', {
          token: storedToken ? "présent" : "absent",
          user: storedUser ? "présent" : "absent"
        });
      }, 500);

      return response; // Retourner la réponse pour permettre au composant de continuer
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
  };  // Update user profile
  const updateUser = useCallback(async (data: { firstName?: string; lastName?: string; email?: string; pseudo?: string; avatar?: string; isPresetAvatar?: boolean; avatarColor?: string; avatarInitials?: string }) => {
    setLoading(true);
    setError(null);

    // S'assurer que nous avons des données utilisateur valides
    if (!user && !data.firstName) {
      setError("Impossible de mettre à jour les données utilisateur: utilisateur non connecté");
      setLoading(false);
      throw new Error("Utilisateur non connecté");
    }

    // Fusionner les données actuelles de l'utilisateur avec les nouvelles données
    const updatedData = {
      firstName: data.firstName !== undefined ? data.firstName : user?.firstName || '',
      lastName: data.lastName !== undefined ? data.lastName : user?.lastName || '',
      email: data.email !== undefined ? data.email : user?.email || '',
      pseudo: data.pseudo !== undefined ? data.pseudo : user?.pseudo || '',
      avatar: data.avatar,
      isPresetAvatar: data.isPresetAvatar,
      avatarColor: data.avatarColor,
      avatarInitials: data.avatarInitials
    };

    console.log('Mise à jour du profil avec les données fusionnées:', {
      ...updatedData,
      avatar: updatedData.avatar ? 'présent' : 'absent',
      avatarColor: updatedData.avatarColor,
      avatarInitials: updatedData.avatarInitials
    });

    try {
      // Envoi des données fusionnées à l'API
      const response = await authService.updateProfile(updatedData);
      console.log('Profil mis à jour, réponse reçue:', {
        ...response.user,
        avatar: response.user.avatar ? 'présent' : 'absent'
      });

      // Créer un utilisateur mis à jour en fusionnant l'utilisateur actuel avec la réponse
      const updatedUser = {
        ...user, // Commencer avec l'utilisateur actuel
        ...response.user, // Appliquer les mises à jour du serveur
        avatarColor: updatedData.avatarColor || user?.avatarColor,
        avatarInitials: updatedData.avatarInitials || user?.avatarInitials
      };

      console.log('Utilisateur mis à jour dans le contexte:', updatedUser);

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

      console.log('Données utilisateur mises à jour dans le localStorage et événement dispatché');
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      console.error("Détails de l'erreur:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // Conserver les données utilisateur actuelles en cas d'erreur
      console.log("Conservation des données utilisateur actuelles en cas d'erreur");
      
      // Afficher un message d'erreur plus précis pour l'utilisateur
      let errorMessage = 'Échec de la mise à jour du profil.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = "Session expirée, veuillez vous reconnecter";
      } else if (err.response?.status === 400) {
        // Essayer d'extraire le message d'erreur spécifique du serveur
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          // Si c'est un tableau d'erreurs de validation
          const validationErrors = err.response.data.errors.map((error: any) => 
            `${error.param}: ${error.msg}`
          ).join(', ');
          errorMessage = `Erreurs de validation: ${validationErrors}`;
        } else {
          errorMessage = "Données invalides dans le formulaire";
        }
      } else if (err.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé, veuillez vous reconnecter";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur, veuillez réessayer plus tard";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      console.error("Message d'erreur final:", errorMessage);
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    console.log('Début upload avatar:', {
      nom: file.name,
      type: file.type,
      taille: file.size
    });

    try {
      const response = await authService.uploadAvatar(file);
      console.log('Upload réussi, réponse:', response);

      // Rafraîchir directement les données utilisateur depuis le serveur
      // sans passer par updateUser pour éviter d'écraser les métadonnées
      try {
        const updatedUserData = await authService.getCurrentUser();
        if (updatedUserData) {
          console.log('Nouvelles données utilisateur après upload avatar:', {
            avatar: updatedUserData.avatar,
            avatarColor: updatedUserData.avatarColor,
            avatarInitials: updatedUserData.avatarInitials,
            isPresetAvatar: updatedUserData.isPresetAvatar
          });

          // Mettre à jour l'état utilisateur avec les données les plus récentes
          setUser(updatedUserData);

          // Mettre à jour l'utilisateur dans le localStorage
          localStorage.setItem('user', JSON.stringify(updatedUserData));

          // Dispatcher un événement pour informer les autres composants
          const event = new Event('userUpdated');
          window.dispatchEvent(event);

          console.log('✅ Données utilisateur complètement rafraîchies après changement d\'avatar');
        }
      } catch (refreshError) {
        console.error('❌ Erreur lors du rafraîchissement des données utilisateur:', refreshError);
        // En cas d'erreur de rafraîchissement, essayer au moins de mettre à jour l'avatar
        if (user && response.avatarUrl) {
          const updatedUser = {
            ...user,
            avatar: response.avatarUrl,
            avatarColor: response.avatarColor || user.avatarColor,
            avatarInitials: response.avatarInitials || user.avatarInitials
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'upload de l'avatar.");
      console.error('Erreur lors de l\'upload de l\'avatar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);
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
        setError,
        login,
        register,
        logout,
        updateUser,
        changePassword,
        uploadAvatar,
        refreshUserData
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