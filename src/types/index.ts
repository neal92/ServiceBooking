export interface Appointment {
  id: string;
  service: string;
  client: string;
  date: string;
  duration: number;
  location: string;
  status: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  servicesCount: number;
  color: string;
}