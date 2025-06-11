import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, CalendarX, Trash2, RotateCcw } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import NewAppointmentModal from '../components/appointments/NewAppointmentModal';
import { Appointment, Service } from '../types';
import { appointmentService, serviceService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';
import ModalPortal from '../components/layout/ModalPortal';

type AppointmentStatus = 'all' | 'upcoming' | 'ongoing' | 'past';
type AppointmentStatusFilter = 'all-status' | 'pending' | 'confirmed' | 'in-progress' | 'cancelled' | 'completed';

const Appointments = () => {  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusFilter>('all-status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [autoUpdateStatus, setAutoUpdateStatus] = useState(true);
  
  // Récupération des paramètres d'URL pour initialiser les filtres
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const timeFilterParam = searchParams.get('timeFilter');
    if (timeFilterParam && ['all', 'upcoming', 'ongoing', 'past'].includes(timeFilterParam)) {
      setStatusFilter(timeFilterParam as AppointmentStatus);
    }
    
    const statusFilterParam = searchParams.get('statusFilter');
    if (statusFilterParam && ['all-status', 'pending', 'confirmed', 'in-progress', 'cancelled', 'completed'].includes(statusFilterParam)) {
      setAppointmentStatusFilter(statusFilterParam as AppointmentStatusFilter);
    }
  }, []);

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
  }, [autoUpdateStatus, appointments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentsData, servicesData] = await Promise.all([
        appointmentService.getAll(),
        serviceService.getAll()
      ]);
      
      setAppointments(appointmentsData);
      setServices(servicesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError('Erreur lors du chargement des rendez-vous');
      setLoading(false);
    }
  };
  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
      await appointmentService.updateStatus(id, status);
      fetchData();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };
  const confirmDeleteAppointment = async (appointment: Appointment): Promise<void> => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      await appointmentService.delete(appointmentToDelete.id.toString());
      fetchData();
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError('Failed to delete appointment');
    }
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

  const filteredAppointments = getFilteredAppointments();

  const handleResetFilters = () => {
    setStatusFilter('all');
    setAppointmentStatusFilter('all-status');
  };

  return (
    <PageTransition type="slide">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes rendez-vous</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez vos rendez-vous existants ou ajoutez-en de nouveaux.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
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

        {/* Conteneur des filtres */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Filtres par période */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              Période
            </h3>
            <div className="flex flex-wrap gap-2">              <button
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
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">        {loading ? (
          <div className="py-12 text-center">
            <div className="loader inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-blue-600 dark:text-blue-400" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">            
            <AppointmentList 
              appointments={filteredAppointments}
              onDelete={async (id) => {
                const appointment = filteredAppointments.find(app => app.id === id);
                if (appointment) {
                  await confirmDeleteAppointment(appointment);
                }
              }}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : (
          <div className="py-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucun rendez-vous</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {statusFilter === 'all' 
                ? 'Vous n\'avez aucun rendez-vous pour le moment.'
                : statusFilter === 'upcoming' 
                  ? 'Vous n\'avez aucun rendez-vous à venir.'
                  : statusFilter === 'ongoing'
                    ? 'Vous n\'avez aucun rendez-vous aujourd\'hui.'
                    : 'Vous n\'avez aucun rendez-vous passé.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                Nouveau rendez-vous
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ModalPortal isOpen={isModalOpen}>
          <NewAppointmentModal 
            isOpen={isModalOpen}
            services={services}
            onClose={() => {
              setIsModalOpen(false);
              fetchData();
            }}
          />
        </ModalPortal>
      )}
      
      {isDeleteModalOpen && appointmentToDelete && (
        <ModalPortal isOpen={isDeleteModalOpen}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirmer la suppression</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAppointmentToDelete(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  onClick={handleDeleteAppointment}
                >
                  <Trash2 className="inline-block mr-1 h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </PageTransition>
  );
};

export default Appointments;
