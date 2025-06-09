import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ListTodo, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/appointments/AppointmentCard';
import { Appointment, Service, Category } from '../types';
import { appointmentService, serviceService, categoryService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';

const Dashboard = () => {  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const displayName = user ? `${user.firstName} ${user.lastName}` : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData, categoriesData] = await Promise.all([
        appointmentService.getAll(),
        serviceService.getAll(),
        categoryService.getAll()
      ]);
      
      setAppointments(appointmentsData);
      setServices(servicesData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  // Get upcoming appointments (today and future)
  const upcomingAppointments = appointments
    .filter(app => {
      if (!app.date) return false;
      const appointmentDate = new Date(app.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Get today's date for reference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle appointment status change (to be implemented)
  const handleStatusChange = async (id: number, status: Appointment['status']) => {
    try {
      await appointmentService.updateStatus(id.toString(), status);
      fetchData();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  // Handle appointment deletion (to be implemented)
  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await appointmentService.delete(id.toString());
        fetchData();
      } catch (err) {
        console.error("Error deleting appointment:", err);
        setError('Erreur lors de la suppression du rendez-vous');
      }
    }
  };

  return (
    <PageTransition type="zoom">      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord</h1>        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bienvenue, {displayName || user?.email || 'Utilisateur'}. Voici un aperçu de vos rendez-vous et prestations.
        </p>
        {error && (
          <div className="mt-2 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {error}
            <button 
              className="absolute top-0 right-0 px-4 py-3" 
              onClick={() => setError(null)}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="flex justify-end mb-8">
        <Link 
          to="/calendar" 
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Voir le calendrier
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rendez-vous à venir</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {appointments.filter(a => new Date(a.date) > new Date()).length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-teal-500 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Rendez-vous terminés</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {appointments.filter(a => a.status === 'completed').length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <ListTodo className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Prestations actives</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{services.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Catégories</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{categories.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming appointments section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-8">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Prochains rendez-vous</h2>
                <a href="/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Voir tous
                </a>
              </div>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard 
                      appointment={appointment} 
                      onDelete={() => handleDeleteAppointment(appointment.id)}
                      onStatusChange={(id, status) => handleStatusChange(parseInt(id), status)}
                    />
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 sm:px-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Aucun rendez-vous à venir</p>
                </li>
              )}
            </ul>
          </div>

          {/* Custom message or additional features can be added here */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Vous souhaitez plus d'informations ?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Consultez les détails de vos rendez-vous dans l'onglet calendrier</p>
                <a
                  href="/calendar"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Voir le calendrier
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
};

export default Dashboard;
