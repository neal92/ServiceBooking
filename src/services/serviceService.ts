import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// Créer une instance axios pour les services avec images
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: number;
  categoryName?: string;
  image?: string;
  createdAt: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: number;
  image?: File;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: number;
}

class ServiceService {
  // Récupérer tous les services
  async getAll(): Promise<Service[]> {
    const response = await apiClient.get('/services');
    return response.data;
  }

  // Récupérer un service par ID
  async getById(id: number): Promise<Service> {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  }

  // Récupérer les services par catégorie
  async getByCategory(categoryId: number): Promise<Service[]> {
    const response = await apiClient.get(`/services/category/${categoryId}`);
    return response.data;
  }

  // Créer un nouveau service avec image
  async create(data: CreateServiceData): Promise<{ message: string; serviceId: number }> {
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('duration', data.duration.toString());
    formData.append('categoryId', data.categoryId.toString());
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.post('/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Mettre à jour un service avec image
  async update(data: UpdateServiceData): Promise<{ message: string }> {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.price) formData.append('price', data.price.toString());
    if (data.duration) formData.append('duration', data.duration.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    if (data.description !== undefined) formData.append('description', data.description);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.put(`/services/${data.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Supprimer un service
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  }

  // Construire l'URL de l'image d'un service
  getImageUrl(imageName: string): string {
    return `/images/services/${imageName}`;
  }

  // Vérifier si un service a une image
  hasImage(service: Service): boolean {
    return !!(service.image && service.image.trim() !== '');
  }
}

export default new ServiceService();
