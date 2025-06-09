import axios from 'axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface UploadAvatarResponse {
  avatarUrl: string;
}

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor - Token in localStorage:', token ? 'present' : 'not present');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Interceptor - Added Authorization header');
    
    // Décodez et affichez le contenu du token pour débogage (sans vérification de signature)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      console.log('Interceptor - Token payload:', JSON.parse(jsonPayload));
    } catch (e) {
      console.error('Interceptor - Failed to decode token:', e);
    }
  }
  return config;
}, (error) => {
  console.error('Interceptor - Request error:', error);
  return Promise.reject(error);
});

const authService = {    register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('Sending registration request with data:', userData);
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      console.log('Registration successful, received response:', response.data);
      
      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      // Extract the specific error message from the response if available
      const errorMessage = error.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },
  
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', {
        token: response.data.token ? 'present' : 'not present',
        user: response.data.user ? 'present' : 'not present'
      });
      
      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Saved to localStorage - Token and user data');
      } else {
        console.warn('No token received in login response');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const status = error.response?.status;
      
      // Handle specific status codes
      if (status === 401) {
        throw new Error('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
      } else {
        throw new Error(error.response?.data?.message || 'Erreur lors de la connexion. Veuillez réessayer.');
      }
    }
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
  
  updateProfile: async (userData: ProfileUpdateData): Promise<{ user: User }> => {
    const response = await apiClient.put<{ user: User }>('/auth/profile', userData);
    
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },  changePassword: async (passwordData: PasswordChangeData): Promise<{ message: string }> => {
    console.log('Envoi requête changement mot de passe...');
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Aucun token d\'authentification trouvé');
      throw new Error('Vous devez être connecté pour changer votre mot de passe');
    }

    try {
      // Créer une requête spécifique pour le changement de mot de passe
      const response = await axios({
        method: 'put',
        url: `${API_URL}/auth/password`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: passwordData
      });
      
      console.log('Réponse changement mot de passe:', response.data);
      return response.data;    } catch (err: any) {
      console.error('Erreur changement mot de passe:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        console.error('Endpoint introuvable. URL utilisée:', `${API_URL}/auth/password`);
      }      // Détecter toutes les variations possibles de l'erreur de mot de passe incorrect
      if ((err.response?.status === 401 && 
          (err.response?.data?.message === 'Current password is incorrect' || 
           err.response?.data?.code === 'INVALID_CURRENT_PASSWORD')) || 
          (err.response?.data?.message && 
           err.response?.data?.message.toLowerCase().includes('password') && 
           err.response?.data?.message.toLowerCase().includes('incorrect'))) {
        // Créer une erreur personnalisée pour un mot de passe incorrect avec un type spécial
        const error = new Error('Current password is incorrect');
        error.name = 'IncorrectPasswordError'; // Ajout d'un nom spécifique à l'erreur
        console.log('Erreur de mot de passe incorrect détectée dans le service:', error);
        throw error;
      }
      
      // Propager l'erreur du serveur si disponible, sinon utiliser un message par défaut
      throw err.response?.data || err;
    }
  },
  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    console.log('Début uploadAvatar avec fichier:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const formData = new FormData();
    formData.append('avatar', file);

    // Si le nom du fichier commence par avatar et finit par .svg, c'est un avatar prédéfini
    const isPredefined = file.name.match(/^avatar\d+\.svg$/);
    if (isPredefined) {
      console.log('Avatar prédéfini détecté:', file.name);
      formData.append('isPredefined', 'true');
    }

    try {
      console.log('Envoi de la requête POST /auth/avatar');
      const response = await apiClient.post<UploadAvatarResponse>('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Réponse uploadAvatar reçue:', response.data);

      // Update stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        console.log('Mise à jour des données utilisateur stockées');
        const userData = JSON.parse(storedUser);
        userData.avatar = response.data.avatarUrl;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return response.data;
    } catch (err) {
      console.error('Erreur dans uploadAvatar:', err);
      throw err;
    }
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default authService;
