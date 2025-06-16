export interface Appointment {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: number;
  serviceName?: string; // From JOIN with services
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'cancelled' | 'completed';
  notes: string;
  price?: number; // From JOIN with services
  duration?: number; // From JOIN with services
  createdAt?: string;
  createdBy?: 'client' | 'admin'; // Indique qui a créé le rendez-vous
  Service?: Service; // Relation avec le service
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // Duration in minutes
  categoryId: number;
  categoryName?: string; // From JOIN with categories
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color?: string;
  createdAt?: string;
  // This is a virtual field not in database but can be calculated on backend via SQL query
  servicesCount?: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  isPresetAvatar?: boolean;
}