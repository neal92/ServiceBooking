import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

import AppointmentCard from '../components/appointments/AppointmentCard';
import { Appointment, Service, Category } from '../types';
import { appointmentService, serviceService, categoryService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';

const Dashboard = () => {
  const { user } = useAuth();
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
    <PageTransition type="slide">      <div className="mb-8">        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord</h1>        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Bienvenue, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.email || 'Utilisateur')}. Voici un aperçu de vos rendez-vous et prestations.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">                {/* Confirmés aujourd'hui */}
                <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">Confirmés aujourd'hui</dt>
                    <dd className="mt-2 text-4xl font-bold text-blue-700 dark:text-blue-300">
                      {appointments.filter(a => {
                        const appointmentDate = new Date(a.date);
                        const today = new Date();
                        return appointmentDate.toDateString() === today.toDateString() && a.status === 'confirmed';
                      }).length}                    </dd>                    <div className="mt-4">                      <Link
                        to="/app/appointments?statusFilter=confirmed&timeFilter=ongoing"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                </div>                {/* En attente */}
                <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-amber-700 dark:text-amber-300 truncate">En attente</dt>
                    <dd className="mt-2 text-4xl font-bold text-amber-700 dark:text-amber-300">
                      {appointments.filter(a => a.status === 'pending').length}
                    </dd>                    <div className="mt-4">                      <Link
                      to="/app/appointments?statusFilter=pending"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                    >
                      Voir
                    </Link>
                    </div>
                  </div>
                </div>{/* Taux de complétion */}
                <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-xl p-6 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <div className="flex flex-col h-full">
                    <dt className="text-sm font-medium text-green-700 dark:text-green-300 truncate">Taux de complétion</dt>
                    <dd className="mt-2 text-4xl font-bold text-green-700 dark:text-green-300">
                      {Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) || 0}%
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming appointments section */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl mb-8">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">                <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Prochains rendez-vous
              </h2>
            </div>
            </div>
            <div className="py-4">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <li className="px-6 py-6 flex justify-center">
                    <div className="animate-pulse flex items-center space-x-2">
                      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </li>
                ) : upcomingAppointments.length > 0 ? (
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
                  <li className="px-6 py-8">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pas de prochain rendez-vous</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vous n'avez aucun rendez-vous planifié pour le moment</p>
                    </div>
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
                  </dt>                  <div className="mt-auto">
                    <Link
                      to="/app/services"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Voir
                    </Link>
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
                  </dt>                  <div className="mt-auto">
                    <Link
                      to="/app/categories"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Voir
                    </Link>
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
