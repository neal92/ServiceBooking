import { Appointment, Service, Category } from '../types';

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Coupe de cheveux',
    description: 'Coupe professionnelle adaptée à votre style et type de cheveux.',
    price: 35,
    duration: 45,
    category: 'Coiffure'
  },
  {
    id: '2',
    name: 'Coloration',
    description: 'Coloration complète avec des produits de qualité professionnelle.',
    price: 75,
    duration: 120,
    category: 'Coiffure'
  },
  {
    id: '3',
    name: 'Massage relaxant',
    description: 'Massage du corps entier pour détendre les muscles et l\'esprit.',
    price: 90,
    duration: 60,
    category: 'Bien-être'
  },
  {
    id: '4',
    name: 'Manucure',
    description: 'Soin des ongles et des mains avec pose de vernis.',
    price: 25,
    duration: 30,
    category: 'Esthétique'
  },
  {
    id: '5',
    name: 'Pédicure',
    description: 'Soin complet des pieds avec massage et pose de vernis.',
    price: 35,
    duration: 45,
    category: 'Esthétique'
  },
  {
    id: '6',
    name: 'Consultation diététique',
    description: 'Analyse de vos habitudes alimentaires et conseils personnalisés.',
    price: 60,
    duration: 60,
    category: 'Santé'
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Coiffure',
    description: 'Services de coiffure et soins capillaires',
    servicesCount: 2,
    color: 'blue'
  },
  {
    id: '2',
    name: 'Bien-être',
    description: 'Massages et soins relaxants',
    servicesCount: 1,
    color: 'green'
  },
  {
    id: '3',
    name: 'Esthétique',
    description: 'Soins esthétiques pour le visage et le corps',
    servicesCount: 2,
    color: 'purple'
  },
  {
    id: '4',
    name: 'Santé',
    description: 'Consultations et soins liés à la santé',
    servicesCount: 1,
    color: 'teal'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    service: 'Coupe de cheveux',
    client: 'Jean Dupont',
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    duration: 45,
    location: 'Salon principal',
    status: 'À venir'
  },
  {
    id: '2',
    service: 'Massage relaxant',
    client: 'Marie Martin',
    date: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    duration: 60,
    location: 'Salle de massage 2',
    status: 'À venir'
  },
  {
    id: '3',
    service: 'Consultation diététique',
    client: 'Sophie Lefevre',
    date: new Date(Date.now() - 86400000).toISOString(), // yesterday
    duration: 60,
    location: 'Bureau 3',
    status: 'Terminé'
  },
  {
    id: '4',
    service: 'Coloration',
    client: 'Pierre Dubois',
    date: new Date().toISOString(), // today
    duration: 120,
    location: 'Salon principal',
    status: 'En cours'
  },
  {
    id: '5',
    service: 'Pédicure',
    client: 'Isabelle Moreau',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    duration: 45,
    location: 'Salle de soins 1',
    status: 'Terminé'
  }
];