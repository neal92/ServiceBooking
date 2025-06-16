import axios from 'axios';
import { Appointment, Service, Category } from '../types';
// Auth service is imported in this file but currently not used directly
// It may be needed for future authentication features
// import authService from './auth';
import { API_BASE_URL } from '../utils/config';

const API_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

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
    const response = await apiClient.post('/categories', category);
    return response.data;
  },
  
  update: async (id: string, category: Omit<Category, 'id' | 'servicesCount' | 'createdAt'>): Promise<void> => {
    await apiClient.put(`/categories/${id}`, category);
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};

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
  
  create: async (service: Omit<Service, 'id'>): Promise<{ serviceId: string }> => {
    const response = await apiClient.post('/services', {
      ...service,
      price: Number(service.price),
      duration: Number(service.duration)
    });
    return response.data;
  },
  
  update: async (id: string, service: Omit<Service, 'id'>): Promise<void> => {
    await apiClient.put(`/services/${id}`, {
      ...service,
      price: Number(service.price),
      duration: Number(service.duration)
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
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
      clientPhone: appointment.clientPhone || '',
      serviceId: appointment.serviceId, 
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || '',
      createdBy: appointment.createdBy || 'client' // Ajout du champ createdBy
    });
    return response.data;
  },
  
  update: async (id: string, appointment: Omit<Appointment, 'id'>): Promise<void> => {
    await apiClient.put(`/appointments/${id}`, {
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail || '',
      clientPhone: appointment.clientPhone || '',
      serviceId: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || ''
    });
  },    updateStatus: async (id: string, status: Appointment['status']): Promise<void> => {
    try {    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
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

export default {
  categories: categoryService,
  services: serviceService,
  appointments: appointmentService
};
