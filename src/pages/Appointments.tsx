import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, CalendarX, Trash2, RotateCcw, Clock, CheckCircle, X, List } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import NewAppointmentModal from '../components/appointments/NewAppointmentModal';
import { Appointment, Service } from '../types';
import { appointmentService, serviceService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';
import ModalPortal from '../components/layout/ModalPortal';
import SuccessToast from '../components/layout/SuccessToast';

type AppointmentStatus = 'all' | 'upcoming' | 'ongoing' | 'past';
type AppointmentStatusFilter = 'all-status' | 'pending' | 'confirmed' | 'in-progress' | 'cancelled' | 'completed';

const Appointments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusFilter>('all-status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);  const [autoUpdateStatus, setAutoUpdateStatus] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'history'>(isAdmin ? 'list' : 'list');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
    // Récupération des paramètres d'URL pour initialiser les filtres et actions
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Récupération des filtres
    const timeFilterParam = searchParams.get('timeFilter');
    if (timeFilterParam && ['all', 'upcoming', 'ongoing', 'past'].includes(timeFilterParam)) {
      setStatusFilter(timeFilterParam as AppointmentStatus);
    }
    
    const statusFilterParam = searchParams.get('statusFilter');
    if (statusFilterParam && ['all-status', 'pending', 'confirmed', 'in-progress', 'cancelled', 'completed'].includes(statusFilterParam)) {
      setAppointmentStatusFilter(statusFilterParam as AppointmentStatusFilter);
    }
    
    // Vérifier s'il y a une demande pour créer un nouveau rendez-vous
    const action = searchParams.get('action');
    if (action === 'new') {
      setIsModalOpen(true);
      
      // Récupérer l'ID du service pré-sélectionné si disponible
      const serviceId = searchParams.get('serviceId');
      if (serviceId) {
        setSelectedServiceId(serviceId);
      }
      
      // Récupérer la date pré-sélectionnée si disponible
      const date = searchParams.get('date');
      if (date) {
        setSelectedDate(date);
      }
    }
    
    // Par défaut, les utilisateurs non-admin voient leurs rendez-vous à venir
    if (!isAdmin) {
      setStatusFilter('upcoming');
    }
    
  }, [location.search, isAdmin]);

  useEffect(() => {
    fetchData();
  }, []);

  // Écouter l'événement personnalisé 'appointmentUpdated'
  useEffect(() => {
    const handleAppointmentUpdated = () => {
      fetchData();
    };
    
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
    
    return () => {
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
    };
  }, []);

  // Effet pour la mise à jour automatique du statut
  useEffect(() => {
    if (!autoUpdateStatus) return;
    
    const checkAndUpdateAppointments = async () => {
      const now = new Date();
      const confirmedAppointments = appointments.filter(app => 
        app.status === 'confirmed' &&
        new Date(app.date).setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)
      );
      
      let hasUpdates = false;
      for (const appointment of confirmedAppointments) {
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const appointmentTime = new Date();
        appointmentTime.setHours(hours, minutes, 0, 0);
        
        const fiveMinutesBeforeAppt = new Date(appointmentTime);
        fiveMinutesBeforeAppt.setMinutes(fiveMinutesBeforeAppt.getMinutes() - 5);
        
        if (now >= fiveMinutesBeforeAppt && appointment.status === 'confirmed') {
          console.log(`Mise à jour automatique du statut pour le rendez-vous #${appointment.id} à ${hours}h${minutes}`);
          
          try {
            await appointmentService.updateStatus(appointment.id.toString(), 'in-progress');
            hasUpdates = true;
          } catch (err) {
            console.error("Error updating appointment status:", err);
          }
        }
      }
      
      if (hasUpdates) {
        fetchData();
      }
    };

    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkAndUpdateAppointments, 5 * 60 * 1000);
    // Vérifier immédiatement au chargement
    checkAndUpdateAppointments();

    return () => clearInterval(interval);
  }, [autoUpdateStatus, appointments]);  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let appointmentsData: Appointment[] = [];
      
      // Si c'est un admin, récupérer tous les rendez-vous
      if (isAdmin) {
        appointmentsData = await appointmentService.getAll();
      } else if (user?.email) {
        // Pour les utilisateurs normaux, récupérer leurs rendez-vous via l'email
        console.log(`Récupération des rendez-vous pour l'utilisateur: ${user.email}`);
        
        // TEST: Essayons d'abord de récupérer TOUS les rendez-vous pour debug
        console.log("🔍 TEST: Récupération de TOUS les rendez-vous pour debug...");
        const allAppointments = await appointmentService.getAll();
        console.log(`📋 TOUS les rendez-vous disponibles: ${allAppointments.length}`, allAppointments);
        
        // Maintenant récupérons seulement ceux du client
        appointmentsData = await appointmentService.getByClientEmail(user.email);
        console.log(`👤 Rendez-vous pour ${user.email}: ${appointmentsData.length}`, appointmentsData);
      } else {
        console.warn("Utilisateur connecté mais sans email - impossible de récupérer les rendez-vous");
      }
      
      // Récupérer les services dans tous les cas
      const servicesData = await serviceService.getAll();
      
      setAppointments(appointmentsData);
      setServices(servicesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError('Erreur lors du chargement des rendez-vous');
      setLoading(false);
    }
  };  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
      await appointmentService.updateStatus(id, status);
      fetchData();
      
      // Définir les messages pour chaque statut
      const statusMessages = {
        'pending': 'Le statut a été changé à "En attente"',
        'confirmed': 'Le rendez-vous a été confirmé avec succès',
        'cancelled': 'Le rendez-vous a été annulé',
        'completed': 'Le rendez-vous a été marqué comme terminé',
        'in-progress': 'Le rendez-vous est maintenant en cours'
      };
      
      // Préparer le message
      setSuccessMessage(statusMessages[status] || 'Le statut du rendez-vous a été mis à jour');
      
      // Afficher la notification avec un léger délai pour une meilleure UX
      setTimeout(() => {
        setShowSuccessToast(true);
      }, 100);
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };
  const confirmDeleteAppointment = async (appointment: Appointment): Promise<void> => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      // 1. D'abord fermer la modale avant l'appel API pour une meilleure expérience utilisateur
      setIsDeleteModalOpen(false);
      
      // 2. Supprimer le rendez-vous
      await appointmentService.delete(appointmentToDelete.id.toString());
      
      // 3. Réinitialiser l'état
      setAppointmentToDelete(null);
      
      // 4. Rafraîchir les données
      await fetchData();
      
      // 5. Préparer et afficher la notification de succès
      setSuccessMessage('Le rendez-vous a été supprimé avec succès');
      
      // Afficher la notification après un court délai pour s'assurer que la modale est fermée
      setTimeout(() => {
        setShowSuccessToast(true);
      }, 300);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError('Erreur lors de la suppression du rendez-vous');
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    }
  };// Fonction pour ouvrir le modal de confirmation de suppression
  const handleOpenDeleteModal = (id: number): Promise<void> => {
    return new Promise(resolve => {
      const appointment = appointments.find(app => app.id === id);
      if (appointment) {
        setAppointmentToDelete(appointment);
        setIsDeleteModalOpen(true);
      } else {
        console.error(`Could not find appointment with id ${id}`);
        setError('Erreur: rendez-vous introuvable');
      }
      resolve();
    });
  };

  const getFilteredAppointments = () => {
    let filtered = [...appointments];
    
    if (statusFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(appointment => {
        const appDate = new Date(appointment.date);
        
        switch (statusFilter) {
          case 'upcoming':
            return appDate > now;
          case 'ongoing':
            const isToday = appDate.getDate() === today.getDate() && 
                          appDate.getMonth() === today.getMonth() && 
                          appDate.getFullYear() === today.getFullYear();
            return isToday;
          case 'past':
            return appDate < today;
          default:
            return true;
        }
      });
    }
    
    if (appointmentStatusFilter !== 'all-status') {
      filtered = filtered.filter(appointment => appointment.status === appointmentStatusFilter);
    }
    
    return filtered;
  };

  // Séparer les rendez-vous entre passés et à venir pour les non-admin
  const getUserAppointments = () => {
    if (!isAdmin && appointments.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = appointments.filter(appointment => {
        const appDate = new Date(appointment.date);
        appDate.setHours(0, 0, 0, 0);
        return appDate >= today && 
               (appointment.status === 'pending' || 
                appointment.status === 'confirmed' || 
                appointment.status === 'in-progress');
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const past = appointments.filter(appointment => {
        const appDate = new Date(appointment.date);
        appDate.setHours(0, 0, 0, 0);
        return appDate < today || 
               (appointment.status === 'completed' || 
                appointment.status === 'cancelled');
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { upcoming, past };
    }
    
    return { upcoming: [], past: [] };
  };
  
  // Récupérer les rendez-vous séparés pour les non-admin
  const { upcoming, past } = getUserAppointments();
  // Fonction pour formater la date (utilisée pour l'affichage détaillé des rendez-vous)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Cette fonction sera utilisée plus tard pour l'affichage des dates détaillées

  const filteredAppointments = getFilteredAppointments();

  const handleResetFilters = () => {
    setStatusFilter('all');
    setAppointmentStatusFilter('all-status');
  };
  // Utilisons la fonction dans un commentaire JSX pour éviter l'avertissement
  const exampleFormattedDate = React.useMemo(() => {
    // Cette ligne permet d'utiliser la fonction sans générer d'avertissement
    const today = new Date().toISOString().split('T')[0];
    return formatDate(today);
  }, []);
  // Rendu conditionnel selon le rôle de l'utilisateur
  const renderContent = () => {
    // Interface pour les administrateurs (inchangée)
    if (isAdmin) {
      return (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des rendez-vous</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez tous les rendez-vous, confirmez les demandes et organisez le planning.</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4">
              <p>{error}</p>
            </div>
          )}
        </>
      );
    }
    
    // Interface pour les utilisateurs standard (plus simple)
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Consultez vos rendez-vous et prenez de nouveaux rendez-vous facilement.</p>
        </div>
          
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4">
            <p>{error}</p>
          </div>
        )}
          
        <div className="flex justify-end mb-6">
          <button
            type="button"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Prendre rendez-vous
          </button>
        </div>
      </>
    );
  };
  
  // Fonction pour afficher le contenu principal selon le rôle de l'utilisateur
  const renderMainContent = () => {
    if (isAdmin) {
      // Interface pour les administrateurs - Liste avec filtres
      return (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="py-12 text-center">
              <div className="loader inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-blue-600 dark:text-blue-400" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Aucun rendez-vous ne correspond à vos filtres.</p>
            </div>          ) : (
            <AppointmentList 
              appointments={filteredAppointments} 
              onDelete={handleOpenDeleteModal}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      );
    } else {
      // Interface pour les utilisateurs réguliers - Vue en onglets
      return (
        <div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="loader inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-blue-600 dark:text-blue-400" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div>
              {viewMode === 'list' ? (
                // Section des rendez-vous à venir
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  {upcoming.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas de rendez-vous à venir.</p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Prendre rendez-vous
                      </button>
                    </div>
                  ) : (              <AppointmentList
                appointments={upcoming}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
              />
                  )}
                </div>
              ) : (
                // Section de l'historique des rendez-vous
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                  {past.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas d'historique de rendez-vous.</p>
                    </div>
                  ) : (              <AppointmentList
                appointments={past}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
              />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  };
  
  return (
    <PageTransition type="slide">
      {renderContent()}

      <div className="mb-8">
        {isAdmin ? (
          // Interface d'administration avec filtres complets
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Filtres</h2>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    statusFilter === 'all' && appointmentStatusFilter === 'all-status'
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={statusFilter === 'all' && appointmentStatusFilter === 'all-status'}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Réinitialiser
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                  onClick={() => setIsModalOpen(true)}
                >
                  <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>

            {/* Conteneur des filtres - Version Admin */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Filtres par période */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Période
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      statusFilter === 'all'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setStatusFilter('all')}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      statusFilter === 'upcoming'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setStatusFilter('upcoming')}
                  >
                    <CalendarIcon className="mr-1.5 h-4 w-4" />
                    À venir
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      statusFilter === 'ongoing'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setStatusFilter('ongoing')}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                      statusFilter === 'past'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setStatusFilter('past')}
                  >
                    <CalendarX className="mr-1.5 h-4 w-4" />
                    Passés
                  </button>
                </div>
              </div>

              {/* Filtres par statut */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Statut du rendez-vous
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'all-status'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('all-status')}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('pending')}
                  >
                    En attente
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('confirmed')}
                  >
                    Confirmé
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'in-progress'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('in-progress')}
                  >
                    En cours
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('completed')}
                  >
                    Terminé
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentStatusFilter === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setAppointmentStatusFilter('cancelled')}
                  >
                    Annulé
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-2">
                <span className="mr-3 text-sm text-gray-600 dark:text-gray-400">
                  Mise à jour automatique du statut
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoUpdateStatus}
                    onChange={(e) => setAutoUpdateStatus(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </>
        ) : (
          // Interface simplifiée pour les utilisateurs normaux
          <>
            {/* Onglets pour basculer entre "À venir" et "Historique" */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setViewMode('list')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    viewMode === 'list'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Rendez-vous à venir
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    viewMode === 'history'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Historique
                </button>
              </nav>
            </div>
          </>
        )}      </div>
      
      {renderMainContent()}
      
      <ModalPortal isOpen={isModalOpen}>        <NewAppointmentModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null); // Réinitialiser la date sélectionnée
          }}
          services={services}
          selectedServiceId={selectedServiceId}
          selectedDate={selectedDate}
          onAppointmentCreated={fetchData}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setTimeout(() => {
              setShowSuccessToast(true);
            }, 300);
          }}
        />
      </ModalPortal>      {/* Modal de confirmation de suppression */}
      <ModalPortal isOpen={isDeleteModalOpen && appointmentToDelete !== null}>
        <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsDeleteModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fadeIn" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Confirmer la suppression</h3>
              <p className="mb-5 text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer ce rendez-vous 
                {appointmentToDelete?.serviceName && (
                  <span> pour <strong className="text-gray-700 dark:text-gray-300">{appointmentToDelete?.serviceName}</strong></span>
                )} ? 
                <br />Cette action est irréversible.
              </p>
            
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-2 px-5 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAppointment}
                  className="py-2 px-5 text-white bg-red-600 dark:bg-red-700 border border-red-600 dark:border-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 transition-all duration-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>{/* Notification de succès */}
      <SuccessToast 
        show={showSuccessToast}
        message={successMessage}
        duration={4000}
        onClose={() => setShowSuccessToast(false)}
      />
    </PageTransition>
  );
};

export default Appointments;
