import axios from 'axios';
import { Appointment, Service, Category } from '../types';
// Import authService to handle proper logout
import authService from './auth';
import { API_BASE_URL } from '../utils/config';

// Fonction centralisée pour gérer l'expiration du token JWT
// Cette fonction garantit que toutes les étapes de déconnexion sont effectuées dans le bon ordre
export const handleTokenExpiration = () => {
  console.log('Gestion centralisée de l\'expiration du token JWT');
  
  // 1. Déconnecter l'utilisateur (supprimer les données d'authentification)
  authService.logout();
  
  // 2. Dispatch un événement pour que le contexte d'authentification puisse réagir
  window.dispatchEvent(new CustomEvent('auth-token-expired', { 
    detail: { message: 'Votre session a expiré. Veuillez vous reconnecter.' }
  }));
  
  // 3. Rediriger vers la page de connexion si nous ne sommes pas déjà dessus
  if (!window.location.pathname.includes('/login')) {
    console.log('Redirection vers la page de connexion...');
    window.location.href = '/login?expired=true';
  }
};

const API_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  // Ne pas définir Content-Type par défaut pour permettre FormData
});

// Add authentication token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ne pas forcer application/json si on envoie FormData
  if (config.data instanceof FormData) {
    // Supprimer le Content-Type pour laisser axios gérer automatiquement
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors, including token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or authentication error
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      
      // Check if token has expired or is invalid
      const isTokenExpired = 
        (error.response.data.code === 'TOKEN_EXPIRED') ||
        (error.response.data.message && 
         (error.response.data.message.includes('expired') || 
          error.response.data.message === 'Invalid token.'));
          
      if (isTokenExpired) {
        console.log('Token has expired or is invalid. Handling token expiration...');
        handleTokenExpiration();
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service for Categories
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id' | 'servicesCount' | 'createdAt'>): Promise<{ categoryId: string }> => {
    const response = await apiClient.post('/categories', category, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  
  update: async (id: string, category: Omit<Category, 'id' | 'servicesCount' | 'createdAt'>): Promise<void> => {
    await apiClient.put(`/categories/${id}`, category, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};

// Types pour l'upload de services
interface ServiceCreateData {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
  image?: File;
}

interface ServiceUpdateData {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
  image?: File;
}

// API Service for Services
export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get('/services');
    return response.data;
  },
  
  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },
  
  getByCategory: async (categoryId: string): Promise<Service[]> => {
    const response = await apiClient.get(`/services/category/${categoryId}`); 
    return response.data;
  },
  
  create: async (service: ServiceCreateData): Promise<{ serviceId: string }> => {
    // Si une image est fournie, utiliser FormData pour l'upload
    if (service.image) {
      const formData = new FormData();
      formData.append('name', service.name);
      formData.append('description', service.description || '');
      formData.append('price', service.price.toString());
      formData.append('duration', service.duration.toString());
      formData.append('categoryId', service.categoryId.toString());
      formData.append('image', service.image);

      const response = await apiClient.post('/services', formData, {
        headers: {
          // Ne pas définir Content-Type, axios va le faire automatiquement avec le boundary
        },
      });
      return response.data;
    } else {
      // Sinon, utiliser la méthode normale
      const response = await apiClient.post('/services', {
        ...service,
        price: Number(service.price),
        duration: Number(service.duration)
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    }
  },
  
  update: async (id: string, service: ServiceUpdateData): Promise<void> => {
    // Si une image est fournie, utiliser FormData pour l'upload
    if (service.image) {
      const formData = new FormData();
      formData.append('name', service.name);
      formData.append('description', service.description || '');
      formData.append('price', service.price.toString());
      formData.append('duration', service.duration.toString());
      formData.append('categoryId', service.categoryId.toString());
      formData.append('image', service.image);

      await apiClient.put(`/services/${id}`, formData, {
        headers: {
          // Ne pas définir Content-Type, axios va le faire automatiquement avec le boundary
        },
      });
    } else {
      // Sinon, utiliser la méthode normale
      await apiClient.put(`/services/${id}`, {
        ...service,
        price: Number(service.price),
        duration: Number(service.duration)
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  // Nouvelle méthode pour récupérer l'image d'un service
  getImageUrl: (serviceId: string, cacheBuster?: boolean): string => {
    const baseUrl = `${API_URL}/services/${serviceId}/image`;
    return cacheBuster ? `${baseUrl}?t=${Date.now()}` : baseUrl;
  },

  // Nouvelle méthode pour récupérer le thumbnail d'un service
  getThumbnailUrl: (serviceId: string, cacheBuster?: boolean): string => {
    const baseUrl = `${API_URL}/services/${serviceId}/thumbnail`;
    return cacheBuster ? `${baseUrl}?t=${Date.now()}` : baseUrl;
  }
};

// API Service for Appointments
export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    // Utilisation de cache: false pour toujours récupérer les données les plus récentes
    const response = await apiClient.get('/appointments', { 
      headers: { 'Cache-Control': 'no-cache' },
      params: { timestamp: new Date().getTime() } // Ajouter un timestamp pour éviter la mise en cache
    });
    return response.data.map((appointment: any) => ({
      ...appointment,
      id: Number(appointment.id),
      serviceId: Number(appointment.serviceId),
      // Pour la compatibilité avec l'ancien format
      service: appointment.serviceName || appointment.serviceId,
    }));
  },
  
  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/appointments/${id}`);
    const appointment = response.data;
    return {
      ...appointment,
      id: Number(appointment.id),
      serviceId: Number(appointment.serviceId),
      // Pour la compatibilité avec l'ancien format
      service: appointment.serviceName || appointment.serviceId,
    };
  },    create: async (appointment: Omit<Appointment, 'id'>): Promise<{ appointmentId: string }> => {
    const response = await apiClient.post('/appointments', {
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail || '',
      serviceId: appointment.serviceId, 
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || '',
      createdBy: appointment.createdBy || 'client' // Ajout du champ createdBy
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  
  update: async (id: string, appointment: Omit<Appointment, 'id'>): Promise<void> => {
    await apiClient.put(`/appointments/${id}`, {
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail || '',
      serviceId: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || ''
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },    updateStatus: async (id: string, status: Appointment['status']): Promise<void> => {
    try {    const response = await apiClient.patch(`/appointments/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.data || response.status !== 200) {
      throw new Error('La mise à jour du statut a échoué');
    }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      if (error.response?.status === 404) {
        throw new Error('Rendez-vous non trouvé');
      }
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },

  getByClientEmail: async (email: string): Promise<Appointment[]> => {
    // Utilisation de cache: false pour toujours récupérer les données les plus récentes
    const response = await apiClient.get('/appointments/client', { 
      headers: { 'Cache-Control': 'no-cache' },
      params: { email, timestamp: new Date().getTime() }
    });
    
    return response.data.map((appointment: any) => ({
      ...appointment,
      id: Number(appointment.id),
      serviceId: Number(appointment.serviceId),
      // Pour la compatibilité avec l'ancien format
      service: appointment.serviceName || appointment.serviceId,
    }));
  },
};

// Notification service
export const notificationService = {
  // Récupérer les notifications de l'utilisateur connecté
  async getAll(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());

    const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
    return response.data;
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: number) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Supprimer une notification
  async delete(notificationId: number) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default {
  categories: categoryService,
  services: serviceService,
  appointments: appointmentService,
  notifications: notificationService
};
