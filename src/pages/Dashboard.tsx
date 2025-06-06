import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, ListTodo, Users } from 'lucide-react';
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

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysAppointments = appointments.filter(app => {
    if (!app.date) return false;
    const appointmentDate = new Date(app.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  });

  // Handle appointment status change (to be implemented)
  const handleStatusChange = async (id: number, status: string) => {
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
    <PageTransition type="zoom">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.email}. Voici un aperçu de vos rendez-vous et prestations.
        </p>
        {error && (
          <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
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
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Voir le calendrier
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rendez-vous à venir</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {appointments.filter(a => new Date(a.date) > new Date()).length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-teal-500 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rendez-vous terminés</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {appointments.filter(a => a.status === 'completed').length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <ListTodo className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Prestations actives</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{services.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Catégories</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{categories.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming appointments section */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Prochains rendez-vous</h2>
                <a href="/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Voir tous
                </a>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard 
                      appointment={appointment} 
                      onDelete={() => handleDeleteAppointment(appointment.id)}
                      onStatusChange={(status) => handleStatusChange(appointment.id, status)}
                    />
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 sm:px-6">
                  <p className="text-sm text-gray-500 text-center">Aucun rendez-vous à venir</p>
                </li>
              )}
            </ul>
          </div>

          {/* Today's schedule */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Planning du jour</h2>
            </div>
            {todaysAppointments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {todaysAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard 
                      appointment={appointment} 
                      onDelete={() => handleDeleteAppointment(appointment.id)}
                      onStatusChange={(status) => handleStatusChange(appointment.id, status)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <div>
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Pas de rendez-vous aujourd'hui</h3>
                    <p className="mt-1 text-sm text-gray-500">Planifiez un nouveau rendez-vous pour aujourd'hui.</p>
                    <div className="mt-6">
                      <a
                        href="/appointments"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Calendar className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Nouveau Rendez-vous
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </PageTransition>
  );
};

export default Dashboard;
