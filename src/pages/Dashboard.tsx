import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
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
    <PageTransition type="slide">      <div className="mb-8">
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

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Main Stats Section - Appointments */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl mb-8 transition-all duration-200 hover:shadow-xl">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Statistiques des rendez-vous
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Confirmés aujourd'hui */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-blue-50 truncate">Confirmés aujourd'hui</dt>
                    <dd className="mt-2 text-4xl font-bold text-white">
                      {appointments.filter(a => {
                        const appointmentDate = new Date(a.date);
                        const today = new Date();
                        return appointmentDate.toDateString() === today.toDateString() && a.status === 'confirmed';
                      }).length}
                    </dd>
                    <div className="mt-4">
                      <a 
                        href="/appointments?status=confirmed" 
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                </div>

                {/* En attente */}
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-amber-50 truncate">En attente</dt>
                    <dd className="mt-2 text-4xl font-bold text-white">
                      {appointments.filter(a => a.status === 'pending').length}
                    </dd>
                    <div className="mt-4">
                      <a 
                        href="/appointments?status=pending" 
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                </div>

                {/* Taux de complétion */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-green-50 truncate">Taux de complétion</dt>
                    <dd className="mt-2 text-4xl font-bold text-white">
                      {Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) || 0}%
                    </dd>
                    <div className="mt-4">
                      <a 
                        href="/appointments?status=completed" 
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming appointments section */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl mb-8">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Prochains rendez-vous
              </h2>
            </div>
            <div className="py-4">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <li key={appointment.id} className="px-6 py-4">
                      <AppointmentCard 
                        appointment={appointment} 
                        onDelete={() => handleDeleteAppointment(appointment.id)}
                        onStatusChange={(id, status) => handleStatusChange(parseInt(id), status)}
                      />
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Aucun rendez-vous à venir</p>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Services & Categories Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Prestations actives */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transition-all duration-200 hover:shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prestations actives</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col">
                  <dd className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{services.length}</dd>
                  <dt className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Prestations disponibles pour vos clients. Gérez vos services et leurs tarifs facilement.
                  </dt>
                  <div className="mt-auto">
                    <a 
                      href="/services" 
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Voir
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transition-all duration-200 hover:shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Catégories</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col">
                  <dd className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{categories.length}</dd>
                  <dt className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Organisez vos prestations par catégories pour une meilleure visibilité de vos services.
                  </dt>
                  <div className="mt-auto">
                    <a 
                      href="/categories" 
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Voir
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
};

export default Dashboard;
