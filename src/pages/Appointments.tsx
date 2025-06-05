import { useState, useEffect } from 'react';
import { PlusCircle, Filter, Calendar as CalendarIcon } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import NewAppointmentModal from '../components/appointments/NewAppointmentModal';
import { Appointment, Service } from '../types';
import { appointmentService, serviceService } from '../services/api';

type AppointmentStatus = 'all' | 'upcoming' | 'ongoing' | 'past';

const Appointments = () => {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        // Convertir l'id en chaîne pour l'API
        await appointmentService.delete(id.toString());
        fetchData();
      } catch (err) {
        console.error("Error deleting appointment:", err);
        setError('Failed to delete appointment');
      }
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      // Convertir l'id en chaîne pour l'API
      await appointmentService.updateStatus(id.toString(), status);
      fetchData();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError('Failed to update appointment status');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchData();
  };
  // Nettoyer les données d'appointments pour éviter les erreurs
  const validAppointments = appointments.map(appointment => ({
    ...appointment,
    id: Number(appointment.id),
    serviceId: Number(appointment.serviceId || 0),
    date: appointment.date || new Date().toISOString(),
    time: appointment.time || '',
    status: appointment.status || 'pending',
    notes: appointment.notes || '',
    clientName: appointment.clientName || '',
    clientEmail: appointment.clientEmail || '',
    clientPhone: appointment.clientPhone || ''
  }));

  const filteredAppointments = validAppointments.filter(appointment => {
    if (!appointment.date) return false;
    
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    switch (statusFilter) {
      case 'upcoming':
        return appointmentDate > today;
      case 'ongoing':
        return appointmentDate.toDateString() === today.toDateString();
      case 'past':
        return appointmentDate < today;
      default:
        return true;
    }
  });
  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-8 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-10">
          <CalendarIcon className="h-64 w-64 text-white" />
        </div>
        <div className="md:flex md:items-center md:justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl">
              Rendez-vous
            </h2>
            <p className="mt-1 text-sm text-indigo-100">
              Gérez votre agenda et vos rendez-vous clients
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all"
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nouveau rendez-vous
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}      {/* Filters */}
      <div className="bg-white p-5 shadow-md rounded-xl mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-2 rounded-full bg-indigo-100 mr-3">
              <Filter className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Filtrer par période</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {statusFilter === 'all' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusFilter === 'all' ? 'bg-white' : 'bg-gray-400'}`}></span>
              </span>
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center ${
                statusFilter === 'upcoming'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {statusFilter === 'upcoming' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusFilter === 'upcoming' ? 'bg-white' : 'bg-green-400'}`}></span>
              </span>
              À venir
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center ${
                statusFilter === 'ongoing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {statusFilter === 'ongoing' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusFilter === 'ongoing' ? 'bg-white' : 'bg-blue-400'}`}></span>
              </span>
              Aujourd'hui
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center ${
                statusFilter === 'past'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                {statusFilter === 'past' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusFilter === 'past' ? 'bg-white' : 'bg-orange-400'}`}></span>
              </span>
              Passés
            </button>
          </div>
        </div>
      </div>      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-pulse h-4 w-4 bg-indigo-600 rounded-full"></div>
            <div className="animate-pulse h-4 w-4 bg-indigo-600 rounded-full animation-delay-200"></div>
            <div className="animate-pulse h-4 w-4 bg-indigo-600 rounded-full animation-delay-400"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des rendez-vous...</p>
        </div>
      ) : (
        // Appointment List
        <>
          {filteredAppointments.length === 0 ? (            <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-12 text-center">
              <div className={`${
                statusFilter === 'all' ? 'bg-indigo-50' : 
                statusFilter === 'upcoming' ? 'bg-green-50' : 
                statusFilter === 'ongoing' ? 'bg-blue-50' : 
                'bg-orange-50'
              } rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6`}>
                <CalendarIcon className={`h-12 w-12 ${
                  statusFilter === 'all' ? 'text-indigo-500' : 
                  statusFilter === 'upcoming' ? 'text-green-500' : 
                  statusFilter === 'ongoing' ? 'text-blue-500' : 
                  'text-orange-500'
                }`} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {statusFilter === 'all' 
                  ? 'Vous n\'avez pas encore de rendez-vous dans votre agenda. Commencez par en créer un nouveau en cliquant sur le bouton ci-dessous.' 
                  : statusFilter === 'upcoming' 
                  ? 'Aucun rendez-vous à venir n\'est prévu dans votre agenda. Cliquez sur le bouton ci-dessous pour en programmer un nouveau.' 
                  : statusFilter === 'ongoing' 
                  ? 'Vous n\'avez pas de rendez-vous prévus aujourd\'hui. Votre journée semble libre !' 
                  : 'Aucun rendez-vous passé n\'a été trouvé dans votre historique.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={`inline-flex items-center px-5 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white ${
                    statusFilter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 
                    statusFilter === 'upcoming' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                    statusFilter === 'ongoing' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 
                    'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150`}
                >
                  <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  {statusFilter === 'all' || statusFilter === 'upcoming'
                    ? 'Créer un rendez-vous'
                    : statusFilter === 'ongoing'
                    ? 'Planifier un rendez-vous aujourd\'hui'
                    : 'Planifier un nouveau rendez-vous'}
                </button>
              </div>
            </div>
          ) : (            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium leading-none text-center bg-indigo-100 text-indigo-800 rounded-full mr-3">
                    {filteredAppointments.length}
                  </span>
                  <h3 className="font-medium text-gray-700">
                    {filteredAppointments.length === 1 ? 'rendez-vous trouvé' : 'rendez-vous trouvés'}
                  </h3>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  statusFilter === 'all' ? 'bg-indigo-100 text-indigo-800' : 
                  statusFilter === 'upcoming' ? 'bg-green-100 text-green-800' : 
                  statusFilter === 'ongoing' ? 'bg-blue-100 text-blue-800' : 
                  'bg-orange-100 text-orange-800'
                }`}>
                  {statusFilter === 'all' ? 'Tous les rendez-vous' : 
                   statusFilter === 'upcoming' ? 'Rendez-vous à venir' : 
                   statusFilter === 'ongoing' ? 'Rendez-vous aujourd\'hui' : 
                   'Rendez-vous passés'}
                </span>
              </div>
              <div className="p-4">
                <AppointmentList 
                  appointments={filteredAppointments} 
                  onDelete={handleDeleteAppointment} 
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          )}
        </>
      )}

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        services={services}
      />
    </div>
  );
};

export default Appointments;