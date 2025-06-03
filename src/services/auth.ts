import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface RegisterData {
  name: string;
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
  name?: string;
  email?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
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

export const authService = {  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      // Save token and user to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      // Extract the specific error message from the response if available
      const errorMessage = error.response?.data?.message || "Échec de l'inscription. Veuillez réessayer.";
      throw new Error(errorMessage);
    }
  },    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
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
    isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default authService;
