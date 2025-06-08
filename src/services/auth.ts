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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
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
      
      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
  },
  
  changePassword: async (passwordData: PasswordChangeData): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/auth/password', passwordData);
    return response.data;
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
