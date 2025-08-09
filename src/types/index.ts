export interface Appointment {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
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
  image?: string; // Image filename
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color?: string;
  image?: string; // Image filename
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
  pseudo?: string;
  phone?: string;
  avatar?: string;
  avatarColor?: string;
  avatarInitials?: string;
  isPresetAvatar?: boolean;
}

export interface UploadAvatarResponse {
  message: string;
  avatarUrl: string;
  avatarColor?: string;
  avatarInitials?: string;
}