import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ListTodo, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
      // Mettre à jour le state local
      setAppointments(appointments.map(a => {
        if (a.id === id) {
          return { ...a, status };
        }
        return a;
      }));
    } catch (err) {
      console.error("Error updating appointment status:", err); 
      setError('Une erreur est survenue lors de la mise à jour du statut');
      throw err; // Propager l'erreur pour que les composants enfants puissent la gérer
    }
  };

  // Handle appointment deletion (to be implemented)
  const handleDeleteAppointment = async (id: number) => {
    try {
      await appointmentService.delete(id.toString());
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError('Une erreur est survenue lors de la suppression du rendez-vous');
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

      {/* Today's quick overview section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 shadow rounded-lg p-6">
        <div className="flex flex-col items-center text-white">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold mb-2">Aujourd'hui</h2>            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold mb-1">
                  {appointments.filter(a => {
                    const appointmentDate = new Date(a.date);
                    const today = new Date();
                    return appointmentDate.toDateString() === today.toDateString() && a.status === 'confirmed';
                  }).length}
                </p>
                <p className="text-sm opacity-90">Rendez-vous confirmés</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold mb-1">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-sm opacity-90">Rendez-vous en attente</p>
              </div>              <div className="text-center">
                <p className="text-3xl font-bold mb-1">
                  {Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) || 0}%
                </p>
                <p className="text-sm opacity-90">Taux de complétion</p>
              </div>
            </div>
          </div>
          <a
            href="/calendar"
            className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Voir le calendrier
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : (
        <>
          <br />

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
            <div className="py-4"> {/* Ajout du padding */}
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <li key={appointment.id} className="px-4 py-4"> {/* Ajout du padding pour chaque élément */}
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
          </div>
        </>
      )}
    </PageTransition>
  );
};

export default Dashboard;
