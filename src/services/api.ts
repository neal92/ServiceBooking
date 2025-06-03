import axios from 'axios';
import { Appointment, Service, Category } from '../types';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  
  create: async (category: Omit<Category, 'id' | 'servicesCount'>): Promise<{ categoryId: string }> => {
    const response = await apiClient.post('/categories', category);
    return response.data;
  },
  
  update: async (id: string, category: Omit<Category, 'id' | 'servicesCount'>): Promise<void> => {
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
    const response = await apiClient.get('/appointments');
    return response.data.map((appointment: any) => ({
      ...appointment,
      service: appointment.serviceName,  // Map backend field to frontend field
    }));
  },
  
  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/appointments/${id}`);
    const appointment = response.data;
    return {
      ...appointment,
      service: appointment.serviceName,  // Map backend field to frontend field
    };
  },
  
  create: async (appointment: Omit<Appointment, 'id'>): Promise<{ appointmentId: string }> => {
    const response = await apiClient.post('/appointments', {
      clientName: appointment.client,
      clientEmail: '',  // Add these fields as needed in your frontend forms
      clientPhone: '',
      serviceId: appointment.service, // This should be the service ID, not name
      date: appointment.date,
      time: new Date(appointment.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: appointment.status,
      notes: ''  // Add this field as needed in your frontend forms
    });
    return response.data;
  },
  
  update: async (id: string, appointment: Omit<Appointment, 'id'>): Promise<void> => {
    await apiClient.put(`/appointments/${id}`, {
      clientName: appointment.client,
      clientEmail: '',  // Add these fields as needed in your frontend forms
      clientPhone: '',
      serviceId: appointment.service, // This should be the service ID, not name
      date: appointment.date,
      time: new Date(appointment.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: appointment.status,
      notes: ''  // Add this field as needed in your frontend forms
    });
  },
  
  updateStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.patch(`/appointments/${id}/status`, { status });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  }
};

export default {
  categories: categoryService,
  services: serviceService,
  appointments: appointmentService
};
