import { useState, useEffect } from 'react';
import { PlusCircle, Filter, Calendar as CalendarIcon, CalendarX, Trash2 } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import NewAppointmentModal from '../components/appointments/NewAppointmentModal';
import { Appointment, Service } from '../types';
import { appointmentService, serviceService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';
import ModalPortal from '../components/layout/ModalPortal';

type AppointmentStatus = 'all' | 'upcoming' | 'ongoing' | 'past';
type AppointmentStatusFilter = 'all-status' | 'pending' | 'confirmed' | 'in-progress' | 'cancelled' | 'completed';

const Appointments = () => {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusFilter>('all-status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        appointmentService.getAll(),
        serviceService.getAll()
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load appointments or services');
      setLoading(false);
    }
  };
  // Écouter l'événement personnalisé 'appointmentUpdated'
  useEffect(() => {
    const handleAppointmentUpdated = () => {
      fetchData(); // Recharger les rendez-vous après la mise à jour
    };
    
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
    
    return () => {
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
    };
  }, []);
  
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await appointmentService.updateStatus(id.toString(), status);
      fetchData();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError('Failed to update appointment status');
    }
  };
  const confirmDeleteAppointment = (appointment: Appointment | undefined) => {
    if (appointment) {
      setAppointmentToDelete(appointment);
      setIsDeleteModalOpen(true);
    }
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
    
    // Filtre par période (all, upcoming, ongoing, past)
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
    
    // Filtre additionnel par statut d'appointement
    if (appointmentStatusFilter !== 'all-status') {
      filtered = filtered.filter(appointment => appointment.status === appointmentStatusFilter);
    }
    
    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <PageTransition type="zoom">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes rendez-vous</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez vos rendez-vous existants ou ajoutez-en de nouveaux.</p>
      </div>      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-300 p-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        {/* Filtre par statut - en haut */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                appointmentStatusFilter === 'all-status'
                  ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => setAppointmentStatusFilter('all-status')}
            >
              Tous
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                appointmentStatusFilter === 'pending'
                  ? 'border-yellow-600 bg-yellow-600 text-white dark:bg-yellow-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500`}
              onClick={() => setAppointmentStatusFilter('pending')}
            >
              En attente
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                appointmentStatusFilter === 'confirmed'
                  ? 'border-green-600 bg-green-600 text-white dark:bg-green-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500`}
              onClick={() => setAppointmentStatusFilter('confirmed')}
            >
              Confirmé
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                appointmentStatusFilter === 'in-progress'
                  ? 'border-orange-600 bg-orange-600 text-white dark:bg-orange-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500`}
              onClick={() => setAppointmentStatusFilter('in-progress')}
            >
              En cours
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                appointmentStatusFilter === 'completed'
                  ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => setAppointmentStatusFilter('completed')}
            >
              Terminé
            </button>
            <button
              type="button"
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                appointmentStatusFilter === 'cancelled'
                  ? 'border-red-600 bg-red-600 text-white dark:bg-red-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500`}
              onClick={() => setAppointmentStatusFilter('cancelled')}
            >
              Annulé
            </button>
          </div>
          
          {/* Bouton "Nouveau rendez-vous" à droite */}
          <button
            type="button"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Nouveau rendez-vous
          </button>
        </div>
        
        {/* Filtre par période (all, upcoming, ongoing, past) - placé en dessous du bouton */}
        <div className="inline-flex shadow-sm rounded-md">
          <button
            type="button"
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
              statusFilter === 'all'
                ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            onClick={() => setStatusFilter('all')}
          >
            <Filter className="mr-2 h-4 w-4" />
            Tous
          </button>
          <button
            type="button"
            className={`relative inline-flex items-center px-4 py-2 border-t border-b ${
              statusFilter === 'upcoming'
                ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            onClick={() => setStatusFilter('upcoming')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            À venir
          </button>
          <button
            type="button"
            className={`relative inline-flex items-center px-4 py-2 ${
              statusFilter === 'ongoing'
                ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            onClick={() => setStatusFilter('ongoing')}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
              statusFilter === 'past'
                ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-700'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
            onClick={() => setStatusFilter('past')}
          >
            <CalendarX className="mr-2 h-4 w-4" />
            Passés
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {loading ? (
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
              onDelete={(id) => confirmDeleteAppointment(filteredAppointments.find(app => app.id === id)!)}
              onStatusChange={(id, status) => handleStatusChange(id, status)}
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
      </div>        {isModalOpen && (
        <ModalPortal isOpen={isModalOpen}>
          <NewAppointmentModal 
            isOpen={isModalOpen}
            services={services}
            onClose={() => setIsModalOpen(false)}
          />
        </ModalPortal>
      )}
      
      {isDeleteModalOpen && appointmentToDelete && (
        <ModalPortal isOpen={isDeleteModalOpen}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirmer la suppression</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer le rendez-vous du {new Date(appointmentToDelete.date).toLocaleDateString()} avec {appointmentToDelete.clientName} ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setAppointmentToDelete(null);
                  }}
                >
                  Annuler
                </button>
                <button 
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
