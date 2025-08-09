import axios from 'axios';
import { User, UploadAvatarResponse } from '../types';

interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  pseudo?: string;
  // Le champ téléphone n'est pas inclus car la table users n'a pas cette colonne
  role?: "user" | "admin";
  userType?: "client" | "professional";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  isPresetAvatar?: boolean;
  avatarColor?: string;
  avatarInitials?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface PseudoCheckResponse {
  available: boolean;
  message: string;
  suggestions?: string[];
}

interface EmailCheckResponse {
  available: boolean;
  message: string;
}

const API_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(
      "Interceptor - Token in localStorage:",
      token ? `present (starts with ${token.substring(0, 10)}...)` : "not present"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Interceptor - Added Authorization header: Bearer ${token.substring(0, 10)}...`);

      // Décodez et affichez le contenu du token pour débogage (sans vérification de signature)
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
        console.log("Interceptor - Token payload:", JSON.parse(jsonPayload));
      } catch (e) {
        console.error("Interceptor - Failed to decode token:", e);
      }
    }
    return config;
  },
  (error) => {
    console.error("Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

const authService = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log("Sending registration request with data:", userData);
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        userData
      );
      console.log("Registration successful, received response:", response.data);

      // Vérifier que les données utilisateur sont complètes
      if (
        !response.data.user ||
        !response.data.user.id ||
        !response.data.user.email
      ) {
        console.error(
          "Informations utilisateur incomplètes dans la réponse d'inscription",
          response.data.user
        );
        throw new Error(
          "Informations utilisateur incomplètes. Veuillez réessayer."
        );
      }

      // Vérifier et compléter les champs manquants avec les données d'inscription
      const userWithDefaults = {
        ...response.data.user,
        firstName: response.data.user.firstName || userData.firstName || "",
        lastName: response.data.user.lastName || userData.lastName || "",
        pseudo: response.data.user.pseudo || userData.pseudo || "",
        role: response.data.user.role || userData.role || "user",
      };

      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userWithDefaults));
        console.log(
          "Saved to localStorage - Token and user data with defaults"
        );

        // Vérifier que les données ont bien été enregistrées
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!storedToken || !storedUser) {
          console.error("Erreur: Données non enregistrées dans localStorage");
          throw new Error(
            "Échec de l'enregistrement des données utilisateur. Veuillez réessayer."
          );
        }

        console.log(
          "Vérification réussie - Données correctement stockées dans localStorage"
        );

        // Mettre à jour la réponse avec les données complétées
        response.data.user = userWithDefaults;
      } else {
        console.error(
          "Pas de token reçu dans la réponse d'inscription",
          response.data
        );
        throw new Error(
          "Authentification incomplète. Veuillez vous connecter manuellement."
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      // Vérifier si la réponse contient des données JSON
      const errorData = error.response?.data;
      console.log("Error response data:", errorData);

      // Extract the specific error message from the response if available
      let errorMessage =
        errorData?.message ||
        error.message ||
        "Échec de l'inscription. Veuillez réessayer.";

      // Log détaillé pour déboguer
      console.log(`Erreur d'inscription détectée: "${errorMessage}"`);

      // Spécifiquement pour les erreurs liées au pseudo
      if (errorMessage.toLowerCase().includes("pseudo")) {
        // Formatage spécifique pour l'erreur de pseudo déjà utilisé
        errorMessage =
          "Ce pseudo est déjà utilisé. Veuillez en choisir un autre.";
      }
      // Spécifiquement pour les erreurs liées à l'email
      else if (
        errorMessage.toLowerCase().includes("email") ||
        (errorMessage.toLowerCase().includes("adresse") &&
          errorMessage.toLowerCase().includes("déjà"))
      ) {
        errorMessage = "Cette adresse email est déjà utilisée.";
      }

      // Si la réponse contient des erreurs de validation
      if (
        errorData?.errors &&
        Array.isArray(errorData.errors) &&
        errorData.errors.length > 0
      ) {
        const validationErrors = errorData.errors
          .map((err: any) => err.msg || err.message)
          .join(", ");
        errorMessage = `Validation échouée: ${validationErrors}`;
      }

      console.log(`Message d'erreur final: "${errorMessage}"`);
      throw new Error(errorMessage);
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Nettoyer l'email avant l'envoi (supprimer les espaces avant/après)
      const cleanedCredentials = {
        email: credentials.email.trim(),
        password: credentials.password
      };
      
      console.log("Tentative de connexion avec email:", cleanedCredentials.email);
      
      // Réinitialiser localStorage avant tentative de connexion pour éviter tout conflit
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        cleanedCredentials
      );
      console.log("Login response:", {
        token: response.data.token ? "present" : "not present",
        user: response.data.user ? "present" : "not present",
      });

      // Vérifier que les données utilisateur sont complètes
      if (
        !response.data.user ||
        !response.data.user.id ||
        !response.data.user.email
      ) {
        console.error(
          "Informations utilisateur incomplètes dans la réponse de login",
          response.data.user
        );
        throw new Error(
          "Informations utilisateur incomplètes. Veuillez réessayer."
        );
      }

      // Vérifier et compléter les champs manquants
      const userWithDefaults = {
        ...response.data.user,
        firstName: response.data.user.firstName || "",
        lastName: response.data.user.lastName || "",
        role: response.data.user.role || "user",
      };

      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userWithDefaults));
        console.log(
          "Saved to localStorage - Token and user data with defaults"
        );
        
        // Déboguer le token pour s'assurer qu'il contient les bonnes informations
        try {
          const base64Url = response.data.token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          const decodedToken = JSON.parse(jsonPayload);
          console.log("Token décodé après login:", {
            id: decodedToken.id,
            email: decodedToken.email,
            role: decodedToken.role,
            iat: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : 'non présent',
            exp: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'non présent',
          });
        } catch (e) {
          console.error("Erreur lors du décodage du token:", e);
        }

        // Mettre à jour la réponse avec les données complétées
        response.data.user = userWithDefaults;
      } else {
        console.warn("No token received in login response");
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
      }
      
      const status = error.response?.status;

      // Handle specific status codes
      if (status === 401) {
        throw new Error(
          "Identifiants invalides. Veuillez vérifier votre email et mot de passe."
        );
      } else {
        throw new Error(
          error.response?.data?.message ||
            "Erreur lors de la connexion. Veuillez réessayer."
        );
      }
    }
  },
  logout: (): void => {
    console.log("Logout appelé dans authService");

    try {
      // Supprimer toutes les données d'authentification du localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Supprimer d'autres données potentielles liées à l'authentification
      // Ajouter ici si d'autres données sont stockées

      console.log(
        "Déconnexion effectuée - Données d'authentification supprimées"
      );
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{user: User}>("/auth/me");
    console.log("🔍 getCurrentUser - Réponse complète du serveur:", response.data);
    return response.data.user;
  },

  updateProfile: async (
    userData: ProfileUpdateData
  ): Promise<{ user: User }> => {
    const response = await apiClient.put<{ user: User }>(
      "/auth/profile",
      userData
    );

    // Update stored user data
    if (response.data.user) {
      // Ajouter les métadonnées d'avatar à l'objet utilisateur si elles sont présentes
      const updatedUser = {
        ...response.data.user,
      };

      // Conserver les données de couleur et d'initiales si elles ont été fournies
      if (userData.avatarColor) {
        updatedUser.avatarColor = userData.avatarColor;
      }
      if (userData.avatarInitials) {
        updatedUser.avatarInitials = userData.avatarInitials;
      }

      // Stocker l'utilisateur mis à jour
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Mettre à jour la réponse
      response.data.user = updatedUser;
    }

    return response.data;
  },
  changePassword: async (
    passwordData: PasswordChangeData
  ): Promise<{ message: string }> => {
    console.log("Envoi requête changement mot de passe...");

    // Récupérer le token d'authentification
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Aucun token d'authentification trouvé");
      throw new Error(
        "Vous devez être connecté pour changer votre mot de passe"
      );
    }

    try {
      console.log("Données envoyées pour le changement de mot de passe:", {
        currentPassword: passwordData.currentPassword ? "***" : "non fourni",
        newPassword: passwordData.newPassword ? "***" : "non fourni",
      });

      // Créer une requête spécifique pour le changement de mot de passe
      const response = await axios({
        method: "put",
        url: `${API_URL}/auth/password`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: passwordData,
      });

      console.log("Réponse changement mot de passe:", response.data);
      return response.data;
    } catch (err: any) {
      console.error("Erreur changement mot de passe:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 404) {
        console.error(
          "Endpoint introuvable. URL utilisée:",
          `${API_URL}/auth/password`
        );
      }

      // Simulation d'erreur pour tester si un mot de passe incorrect est bien détecté
      if (
        !passwordData.currentPassword ||
        passwordData.currentPassword === "wrong"
      ) {
        console.warn("SIMULATION: Détection d'un mot de passe incorrect");
        const error = new Error("Current password is incorrect");
        error.name = "IncorrectPasswordError";
        throw error;
      }

      // Détecter toutes les variations possibles de l'erreur de mot de passe incorrect
      if (
        (err.response?.status === 401 &&
          (err.response?.data?.message === "Current password is incorrect" ||
            err.response?.data?.code === "INVALID_CURRENT_PASSWORD")) ||
        (err.response?.data?.message &&
          err.response?.data?.message.toLowerCase().includes("password") &&
          err.response?.data?.message.toLowerCase().includes("incorrect"))
      ) {
        // Créer une erreur personnalisée pour un mot de passe incorrect avec un type spécial
        const error = new Error("Current password is incorrect");
        error.name = "IncorrectPasswordError"; // Ajout d'un nom spécifique à l'erreur
        console.log(
          "Erreur de mot de passe incorrect détectée dans le service:",
          error
        );
        throw error;
      }

      // Propager l'erreur du serveur si disponible, sinon utiliser un message par défaut
      throw err.response?.data || err;
    }
  },
  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    console.log("Début uploadAvatar avec fichier:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const formData = new FormData();
    formData.append("avatar", file); // Si le nom du fichier commence par avatar et finit par .svg, c'est un avatar prédéfini
    const isPredefined = file.name.match(/^avatar\d+\.svg$/);
    if (isPredefined) {
      console.log("Avatar prédéfini détecté:", file.name);
      formData.append("isPredefined", "true");
    } else {
      console.log("Avatar personnalisé détecté:", file.name);
      formData.append("isPredefined", "false");
    }

    try {
      // Assurons-nous d'avoir un token d'authentification
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vous devez être connecté pour changer votre avatar");
      }

      console.log(
        "Envoi de la requête POST /auth/avatar avec token d'authentification"
      );
      const response = await apiClient.post<UploadAvatarResponse>(
        "/auth/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Réponse uploadAvatar reçue:", response.data);

      // Update stored user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        console.log("Mise à jour des données utilisateur stockées");
        const userData = JSON.parse(storedUser);
        userData.avatar = response.data.avatarUrl;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return response.data;
    } catch (err) {
      console.error("Erreur dans uploadAvatar:", err);
      throw err;
    }
  },
  isAuthenticated: (): boolean => {
    return localStorage.getItem("token") !== null;
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },
  checkPseudoAvailability: async (
    pseudo: string
  ): Promise<PseudoCheckResponse> => {
    try {
      console.log(`Vérification de la disponibilité du pseudo: ${pseudo}`);
      const response = await axios.get<PseudoCheckResponse>(
        `${API_URL}/auth/check-pseudo`,
        {
          params: { pseudo },
        }
      );
      console.log("Résultat de la vérification du pseudo:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la vérification du pseudo:", error);
      // Décision consciente de propager l'erreur au lieu de la gérer ici
      // Cela permettra au composant d'afficher un message d'erreur approprié
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la vérification du pseudo. Veuillez réessayer."
      );
    }
  },

  checkEmailAvailability: async (
    email: string
  ): Promise<EmailCheckResponse> => {
    try {
      console.log(`Vérification de la disponibilité de l'email: ${email}`);
      const response = await axios.get<EmailCheckResponse>(
        `${API_URL}/auth/check-email`,
        {
          params: { email },
        }
      );
      console.log("Résultat de la vérification de l'email:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la vérification de l'email:", error);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la vérification de l'email. Veuillez réessayer."
      );
    }
  },
};

export default authService;
