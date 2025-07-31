import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Appointment, Service } from '../../types';
import { serviceService, appointmentService } from '../../services/api';
import ModalPortal from '../layout/ModalPortal';
import { useAuth } from '../../contexts/AuthContext';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  services?: Service[]; // Pour une initialisation directe des services depuis le parent
  selectedServiceId?: string | null; // ID du service présélectionné (pour la réservation depuis la page d'accueil)
  selectedDate?: string | null; // Date pré-sélectionnée au format YYYY-MM-DD (pour la réservation depuis le calendrier)
  onAppointmentCreated?: () => Promise<void>; // Callback appelé après la création d'un rendez-vous
  onDelete?: (id: number) => Promise<void>; // Fonction pour supprimer un rendez-vous
  onSuccess?: (message: string) => void; // Callback pour afficher une notification de succès
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  appointment, 
  services: initialServices,   selectedServiceId,
  selectedDate,
  onAppointmentCreated,
  onDelete,
  onSuccess
}) => {
  // Récupérer les informations de l'utilisateur connecté
  const { user } = useAuth();
  
  const [serviceId, setServiceId] = useState(selectedServiceId || '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validatedServices, setValidatedServices] = useState<Service[]>([]);  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Fetch services when modal opens if no services were provided
  useEffect(() => {
    if (isOpen && (!initialServices || initialServices.length === 0)) {
      fetchServices();
    } else if (isOpen && initialServices && initialServices.length > 0) {
      setServices(initialServices);
    }
    // Si un serviceId est fourni, le sélectionner
    if (selectedServiceId && isOpen) {
      setServiceId(selectedServiceId);
    }
  }, [isOpen, initialServices, selectedServiceId]);
  
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
  // Set form values when editing an appointment or when opening the form
  useEffect(() => {
    if (appointment) {
      // Si on édite un rendez-vous existant, utiliser ses valeurs
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
      // Création d'un nouveau rendez-vous
      setServiceId('');
      
      // Si l'utilisateur est connecté et n'est pas admin, pré-remplir ses informations
      if (user && user.role !== 'admin') {
        setClientName(`${user.firstName} ${user.lastName}`);
        setClientEmail(user.email);
        // Le téléphone n'est peut-être pas disponible dans le profil utilisateur
      } else {
        // Si c'est un admin ou utilisateur non connecté, vider les champs
        setClientName('');
        setClientEmail('');
      }
      
      setClientPhone('');
      // Si une date est pré-sélectionnée (depuis le calendrier), l'utiliser
      setDate(selectedDate || '');
      setTime('');
      setNotes('');
    }
  }, [appointment, isOpen, user, selectedDate]);

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
  };  
  
  const handleSubmit = async (e: React.FormEvent) => {
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
        notes: notes || '',
        createdBy: user && user.role === 'admin' ? 'admin' : 'client' // Indique qui a créé le rendez-vous
      } satisfies Omit<Appointment, 'id'>; // Validate against type
      
      console.log('Donnée du rendez-vous à envoyer:', appointmentData);      if (appointment && appointment.id && appointment.id !== 0) {
        await appointmentService.update(appointment.id.toString(), appointmentData);
        console.log("Rendez-vous mis à jour avec succès");
          // Fermer d'abord la modale
        // Émettre un événement personnalisé pour indiquer que les données ont changé
        const event = new CustomEvent('appointmentUpdated', { detail: appointmentData });
        window.dispatchEvent(event);
        onClose();
        
        // Afficher la notification de succès via le callback parent
        if (onSuccess) {
          setTimeout(() => {
            onSuccess('Le rendez-vous a été mis à jour avec succès');
          }, 300);
        }} else {
        const newAppointment = await appointmentService.create(appointmentData);
        console.log("Nouveau rendez-vous créé avec succès:", newAppointment);
          // Émettre un événement personnalisé pour indiquer que les données ont changé
        const event = new CustomEvent('appointmentCreated', { detail: appointmentData });
        window.dispatchEvent(event);
        
        // Appeler le callback si disponible
        if (onAppointmentCreated) {
          await onAppointmentCreated();
        }
        
        // D'abord fermer la modale
        onClose();
        
        // Afficher la notification de succès via le callback parent
        if (onSuccess) {
          setTimeout(() => {
            onSuccess('Votre rendez-vous a été créé avec succès');
          }, 300);
        }
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
    if (!appointment || !appointment.id || appointment.id === 0) return;
    
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
      setIsDeleteModalOpen(false);
      onClose();
      
      // Émettre un événement pour notifier la suppression
      const event = new CustomEvent('appointmentDeleted', { detail: { id: appointment.id } });
      window.dispatchEvent(event);
      
      // Afficher une notification de succès via le callback parent
      if (onSuccess) {
        setTimeout(() => {
          onSuccess('Le rendez-vous a été supprimé avec succès');
        }, 300);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du rendez-vous:', err);
      setError('Erreur lors de la suppression du rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <ModalPortal isOpen={isOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
          {/* Overlay semi-transparent */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
          
          {/* Modal content */}
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-fadeIn mx-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
              <h3 className="text-xl font-semibold text-white animate-fadeIn">
                {appointment && appointment.id && appointment.id !== 0 ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
              </h3>
              <button
                type="button"
                className="text-white hover:text-gray-100 transition-colors duration-200"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {error && (
              <div className="mx-4 mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative animate-fadeIn">
                {error}
              </div>
            )}
            
            {isLoading && (
              <div className="mx-4 mt-4 text-center py-2 animate-fadeIn text-gray-700 dark:text-gray-300">
                <p>Chargement des données...</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-120px)]">
              <div className="px-4 py-3">
                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6 animate-fadeIn animation-delay-400">
                  <div className="sm:col-span-6">
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prestation
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
                  </div>                  <div className="sm:col-span-6">
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom du client
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="clientName"
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 ${
                          user && user.role && user.role !== 'admin' ? 'bg-gray-100 dark:bg-gray-600' : 'dark:bg-gray-700'
                        } dark:text-white rounded-md`}
                        required
                        readOnly={Boolean(user && user.role && user.role !== 'admin')}
                      />                      {user && user.role && user.role !== 'admin' && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Ce champ est automatiquement rempli avec vos informations
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]} // Empêche de sélectionner des dates passées
                        onChange={(e) => {
                          console.log("Nouvelle date sélectionnée:", e.target.value);
                          setDate(e.target.value);
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Heure
                    </label>
                    <div className="mt-1">
                      <input
                        type="time"
                        name="time"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        required
                      />
                    </div>
                  </div>                  <div className="sm:col-span-3">
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email du client
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="clientEmail"
                        id="clientEmail"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 ${
                          user && user.role && user.role !== 'admin' ? 'bg-gray-100 dark:bg-gray-600' : 'dark:bg-gray-700'
                        } dark:text-white rounded-md`}
                        readOnly={Boolean(user && user.role && user.role !== 'admin')}
                      />                      {user && user.role && user.role !== 'admin' && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Ce champ est automatiquement rempli avec votre email
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Téléphone du client
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="clientPhone"
                        id="clientPhone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between animate-fadeIn animation-delay-400">
                  <div>
                    {appointment && appointment.id && appointment.id !== 0 && (
                      <button
                        type="button"
                        className="inline-flex justify-center py-3 px-6 border border-red-300 dark:border-red-600 shadow-sm text-base font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={isSubmitting}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="mr-3 inline-flex justify-center py-3 px-6 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'En cours...' : appointment && appointment.id && appointment.id !== 0 ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
        {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <ModalPortal isOpen={isDeleteModalOpen}>
          <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsDeleteModalOpen(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 animate-fadeIn" style={{ maxHeight: 'calc(100vh - 40px)' }}>              <div className="p-6 text-center">
                <AlertTriangle className="mx-auto mb-4 text-red-500 w-14 h-14" />
                <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Êtes-vous sûr de vouloir supprimer ce rendez-vous ?</h3>
                <p className="mb-5 text-gray-600 dark:text-gray-400">Cette action est irréversible et supprimera définitivement le rendez-vous.</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="py-2 px-5 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAppointment}
                    disabled={isSubmitting}
                    className="py-2 px-5 text-white bg-red-600 dark:bg-red-700 border border-red-600 dark:border-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 transition-all duration-200"
                  >
                    {isSubmitting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>          </div>        </ModalPortal>
      )}
    </>
  );
};

export default NewAppointmentModal;
