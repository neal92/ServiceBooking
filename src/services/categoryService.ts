import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// Créer une instance axios pour les catégories avec images
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

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  image?: string;
  servicesCount?: number;
  createdAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  image?: File;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number;
}

class CategoryService {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  }

  // Récupérer une catégorie par ID
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }

  // Créer une nouvelle catégorie avec image
  async create(data: CreateCategoryData): Promise<{ message: string; categoryId: number }> {
    const formData = new FormData();
    
    formData.append('name', data.name);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.color) {
      formData.append('color', data.color);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Mettre à jour une catégorie avec image
  async update(data: UpdateCategoryData): Promise<{ message: string }> {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.color) formData.append('color', data.color);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.put(`/categories/${data.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Supprimer une catégorie
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }

  // Construire l'URL de l'image d'une catégorie
  getImageUrl(imageName: string): string {
    return `/images/categories/${imageName}`;
  }

  // Vérifier si une catégorie a une image
  hasImage(category: Category): boolean {
    return !!(category.image && category.image.trim() !== '');
  }

  // Obtenir les couleurs prédéfinies pour les catégories
  getAvailableColors(): Array<{ name: string; value: string; class: string }> {
    return [
      { name: 'Bleu', value: 'blue', class: 'bg-blue-500' },
      { name: 'Vert', value: 'green', class: 'bg-green-500' },
      { name: 'Rouge', value: 'red', class: 'bg-red-500' },
      { name: 'Violet', value: 'purple', class: 'bg-purple-500' },
      { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
      { name: 'Rose', value: 'pink', class: 'bg-pink-500' },
      { name: 'Jaune', value: 'yellow', class: 'bg-yellow-500' },
      { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    ];
  }

  // Obtenir la classe CSS pour une couleur
  getColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      yellow: 'bg-yellow-500',
      indigo: 'bg-indigo-500',
    };
    
    return colorMap[color] || 'bg-gray-500';
  }
}

export default new CategoryService();
