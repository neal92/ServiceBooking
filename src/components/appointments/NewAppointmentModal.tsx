import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Appointment, Service } from '../../types';
import { serviceService, appointmentService } from '../../services/api';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  services?: Service[]; // Pour une initialisation directe des services depuis le parent
  onDelete?: (id: number) => Promise<void>; // Fonction pour supprimer un rendez-vous
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, appointment, services: initialServices, onDelete }) => {
  const [serviceId, setServiceId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validatedServices, setValidatedServices] = useState<Service[]>([]);

  // Fetch services when modal opens if no services were provided
  useEffect(() => {
    if (isOpen && (!initialServices || initialServices.length === 0)) {
      fetchServices();
    } else if (isOpen && initialServices && initialServices.length > 0) {
      setServices(initialServices);
    }
  }, [isOpen, initialServices]);
  
  // Validate and process services data to ensure consistent types
  useEffect(() => {
    if (services.length > 0) {
      // Ensure all service objects have proper types to avoid errors
      const validated = services.map(service => ({
        ...service,
        id: typeof service.id === 'string' ? Number(service.id) : service.id,
        price: typeof service.price === 'string' ? Number(service.price) : service.price,
        categoryId: typeof service.categoryId === 'string' ? Number(service.categoryId) : service.categoryId,
        duration: typeof service.duration === 'string' ? Number(service.duration) : service.duration,
        description: service.description || ''
      }));
      setValidatedServices(validated);
    }
  }, [services]);

  // Set form values when editing an appointment
  useEffect(() => {
    if (appointment) {
      setServiceId(appointment.serviceId.toString());
      setClientName(appointment.clientName);
      setClientEmail(appointment.clientEmail || '');
      setClientPhone(appointment.clientPhone || '');
      
      // Extract date and time from appointment.date
      const dateObj = new Date(appointment.date);
      setDate(dateObj.toISOString().split('T')[0]);
      setTime(appointment.time);
      setNotes(appointment.notes || '');
    } else {
      setServiceId('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setDate('');
      setTime('');
      setNotes('');
    }
  }, [appointment, isOpen]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError('Failed to load services');
      setIsLoading(false);
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!serviceId) {
        setError('Veuillez sélectionner une prestation');
        setIsSubmitting(false);
        return;
      }
      
      // Normaliser le format de la date
      let formattedDate = date;
      if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      
      console.log('Soumission du formulaire avec date:', { raw: date, formatted: formattedDate });
      
      // Variables pour la validation de la date et de l'heure
      const now = new Date();
      // Format YYYY-MM-DD pour les comparaisons de chaînes
      const todayStr = now.toISOString().split('T')[0];
      
      // Comparer les chaînes de caractère directement pour éviter les problèmes de fuseau horaire
      // Seulement bloquer les dates antérieures à aujourd'hui, pas les dates futures
      if (formattedDate < todayStr) {
        setError('Impossible de prendre un rendez-vous à une date passée');
        setIsSubmitting(false);
        return;
      }
      
      // Si la date est aujourd'hui, vérifier que l'heure n'est pas dans le passé
      if (formattedDate === todayStr) {
        // S'assurer que time est au format HH:MM
        if (!time || !time.includes(':')) {
          setError('Format d\'heure invalide. Utilisez le format HH:MM');
          setIsSubmitting(false);
          return;
        }
        
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const timeParts = time.split(':');
        const selectedTime = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        
        console.log('Validation de l\'heure:', {
          currentTime,
          selectedTime,
          currentHour: now.getHours(),
          currentMinutes: now.getMinutes(),
          selectedHour: parseInt(timeParts[0]),
          selectedMinutes: parseInt(timeParts[1])
        });
        
        if (selectedTime < currentTime) {
          setError('Impossible de prendre un rendez-vous à une heure passée');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Check for existing appointments at the same time
      try {
        const allAppointments = await appointmentService.getAll();
        const existingAppointment = allAppointments.find(apt => {
          // Skip checking the current appointment when updating
          if (appointment && appointment.id && apt.id === appointment.id) return false;
          
          // Comparer les dates au format ISO pour éviter les problèmes de fuseau horaire
          const aptDateISO = apt.date.split('T')[0];
          const aptTime = apt.time === time;
          return aptDateISO === formattedDate && aptTime;
        });
        
        if (existingAppointment) {
          setError('Un rendez-vous existe déjà à cette date et heure. Veuillez choisir un autre moment.');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des rendez-vous existants:', err);
        // Continue with the submission even if we couldn't check for conflicts
      }
        // Create a fully type-compliant appointment object
      const appointmentData = {
        clientName: clientName || '',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        serviceId: parseInt(serviceId),
        // Utiliser uniquement la partie date (YYYY-MM-DD) sans l'heure
        date: formattedDate,
        time: time || '',
        status: 'pending' as const, // Type assertion to ensure correct status type
        notes: notes || ''
      } satisfies Omit<Appointment, 'id'>; // Validate against type
      
      console.log('Donnée du rendez-vous à envoyer:', appointmentData);      if (appointment && appointment.id) {
        await appointmentService.update(appointment.id.toString(), appointmentData);
        console.log("Rendez-vous mis à jour avec succès");
        
        // Attendre un peu avant de fermer pour permettre à l'API de terminer
        setTimeout(() => {
          // Émettre un événement personnalisé pour indiquer que les données ont changé
          const event = new CustomEvent('appointmentUpdated', { detail: appointmentData });
          window.dispatchEvent(event);
          onClose();
        }, 300);
      } else {
        const newAppointment = await appointmentService.create(appointmentData);
        console.log("Nouveau rendez-vous créé avec succès:", newAppointment);
        
        // Attendre un peu avant de fermer pour permettre à l'API de terminer
        setTimeout(() => {
          // Émettre un événement personnalisé pour indiquer que les données ont changé
          const event = new CustomEvent('appointmentCreated', { detail: appointmentData });
          window.dispatchEvent(event);
          onClose();
        }, 300);
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Failed to save appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour gérer la suppression d'un rendez-vous
  const handleDeleteAppointment = async () => {
    if (!appointment || !appointment.id) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        setIsSubmitting(true);
        
        if (onDelete) {
          // Utiliser la fonction de suppression fournie par le parent
          await onDelete(appointment.id);
        } else {
          // Fallback: appeler directement le service si aucune fonction de suppression n'est fournie
          await appointmentService.delete(appointment.id.toString());
        }
        
        // Fermer la modal après la suppression
        onClose();
        
        // Émettre un événement pour notifier la suppression
        const event = new CustomEvent('appointmentDeleted', { detail: { id: appointment.id } });
        window.dispatchEvent(event);
      } catch (err) {
        console.error('Erreur lors de la suppression du rendez-vous:', err);
        setError('Erreur lors de la suppression du rendez-vous');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">
              {appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {error && (
            <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="mx-4 mt-4 text-center py-2">
              <p>Chargement des données...</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-3 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                    Prestation
                  </label>                  <select
                    id="service"
                    name="service"
                    className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Sélectionner une prestation</option>
                    {validatedServices.length > 0 
                      ? validatedServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.price}€
                          </option>
                        ))
                      : services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.price}€
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Nom du client
                  </label>                  <div className="mt-1">
                    <input
                      type="text"
                      name="clientName"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>                  <div className="mt-1">                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]} // Empêche de sélectionner des dates passées
                      onChange={(e) => {
                        console.log("Nouvelle date sélectionnée:", e.target.value);
                        setDate(e.target.value);
                      }}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Heure
                  </label>                  <div className="mt-1">
                    <input
                      type="time"
                      name="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                    Email du client
                  </label>                  <div className="mt-1">
                    <input
                      type="email"
                      name="clientEmail"
                      id="clientEmail"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">
                    Téléphone du client
                  </label>                  <div className="mt-1">
                    <input
                      type="tel"
                      name="clientPhone"
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 sm:px-6">
              <div className="flex justify-between">
                <div>
                  {/* Bouton de suppression - uniquement affiché pour les rendez-vous existants */}
                  {appointment && appointment.id && (
                    <button
                      type="button"
                      className="inline-flex justify-center py-3 px-6 border border-red-300 shadow-sm text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleDeleteAppointment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Suppression...' : 'Supprimer'}
                    </button>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className="mr-2 inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'En cours...' : appointment && appointment.id ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;