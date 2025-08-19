import { appointmentService } from './api';
import { Appointment } from '../types';

// Fonction pour récupérer tous les rendez-vous
export const fetchAppointments = async (): Promise<Appointment[]> => {
  try {
    return await appointmentService.getAll();
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    throw error;
  }
};

// Fonction pour créer un nouveau rendez-vous
export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<{ appointmentId: string }> => {
  try {
    // Assurez-vous que toutes les propriétés requises sont présentes
    const appointment = {
      clientName: appointmentData.clientName || '',
      clientEmail: appointmentData.clientEmail || '',
      serviceId: appointmentData.serviceId || 0,
      date: appointmentData.date || '',
      time: appointmentData.time || '',
      status: (appointmentData.status as 'pending' | 'confirmed' | 'cancelled' | 'completed') || 'pending',
      notes: appointmentData.notes || ''
    };
    
    return await appointmentService.create(appointment);
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    throw error;
  }
};

// Fonction pour mettre à jour un rendez-vous existant
export const updateAppointment = async (id: number, appointmentData: Partial<Appointment>): Promise<void> => {
  try {
    // Récupérer le rendez-vous actuel pour conserver les données non modifiées
    const currentAppointment = await appointmentService.getById(id.toString());
    
    // Fusionner les données actuelles avec les données mises à jour
    const updatedAppointment = {
      ...currentAppointment,
      ...appointmentData,
      id: currentAppointment.id // Ne pas modifier l'ID
    };
    
    // Supprimer les propriétés qui ne doivent pas être envoyées à l'API
    delete updatedAppointment.Service;
    delete updatedAppointment.createdAt;
    delete updatedAppointment.serviceName;
    delete updatedAppointment.price;
    delete updatedAppointment.duration;
    
    await appointmentService.update(id.toString(), updatedAppointment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le statut d'un rendez-vous
export const updateAppointmentStatus = async (id: number, status: 'pending' | 'confirmed' | 'in-progress' | 'cancelled' | 'completed'): Promise<void> => {
  try {
    await appointmentService.updateStatus(id.toString(), status);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du rendez-vous:', error);
    throw error;
  }
};

// Fonction pour supprimer un rendez-vous
export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await appointmentService.delete(id.toString());
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    throw error;
  }
};
