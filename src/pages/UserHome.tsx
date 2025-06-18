import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, CheckCircle, Search, Calendar, ArrowRight, AlarmClock } from 'lucide-react';
import { Service, Category, Appointment } from '../types';
import { serviceService, categoryService, appointmentService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';
import { useAuth } from '../contexts/AuthContext';

const UserHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les catégories et services en parallèle
        const [servicesData, categoriesData] = await Promise.all([
          serviceService.getAll(),
          categoryService.getAll()
        ]);
        
        setServices(servicesData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les prestations. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  // Fonction pour charger les prochains rendez-vous de l'utilisateur
  const loadUserAppointments = async () => {
    if (!user?.email) return;
    
    try {
      setAppointmentsLoading(true);
        // S'assurer que les services sont chargés
      if (services.length === 0) {
        const serviceData = await serviceService.getAll();
        setServices(serviceData);
        console.log('Services chargés dans loadUserAppointments:', serviceData);
      } else {
        console.log('Services déjà chargés:', services);
      }
      
      // Récupérer les rendez-vous de l'utilisateur par son email
      const appointments = await appointmentService.getByClientEmail(user.email);
      console.log('Rendez-vous récupérés pour', user.email, ':', appointments);
      
      if (!Array.isArray(appointments) || appointments.length === 0) {
        console.log('Aucun rendez-vous trouvé pour cet utilisateur');
        setUpcomingAppointments([]);
        return;
      }
      
      // Filtrer pour ne garder que les rendez-vous à venir (date >= aujourd'hui)
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      console.log('Date d\'aujourd\'hui pour filtrage:', today);
      
      const upcoming = appointments
        .filter(appointment => {          // Gérer différents formats potentiels de date
          let appointmentDate = typeof appointment.date === 'string' ? appointment.date : String(appointment.date);
          if (appointmentDate.includes('T')) {
            appointmentDate = appointmentDate.split('T')[0];
          }
          
          const isUpcoming = appointmentDate >= today && 
                (appointment.status === 'pending' || 
                appointment.status === 'confirmed' ||
                appointment.status === 'in-progress');
          
          console.log('Analyse rendez-vous:', {
            id: appointment.id,
            date: appointmentDate, 
            status: appointment.status,
            dateBrute: appointment.date,
            estÀVenir: isUpcoming
          });
          
          return isUpcoming;
        })        // Trier par date et heure (du plus proche au plus éloigné)
        .sort((a, b) => {
          const dateA = typeof a.date === 'string' ? a.date : String(a.date);
          const dateB = typeof b.date === 'string' ? b.date : String(b.date);
          
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return a.time.localeCompare(b.time);
        })
        // Limiter à 3 rendez-vous maximum
        .slice(0, 3);
        
      console.log('Rendez-vous à venir filtrés:', upcoming);
      setUpcomingAppointments(upcoming);
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };
  // Appeler la fonction de chargement des rendez-vous lorsque l'utilisateur change
  useEffect(() => {
    if (user?.email) {
      // Ajout d'un léger délai pour s'assurer que les services sont chargés
      setTimeout(() => {
        loadUserAppointments();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);
  
  // Filtrer les services en fonction de la recherche et de la catégorie sélectionnée
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || service.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Fonction pour obtenir la couleur de la catégorie
  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#3b82f6'; // Bleu par défaut
  };
  
  // Fonction pour formater la durée
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  };
  // Fonction pour formater la date
  const formatAppointmentDate = (dateString: string, showWeekday: boolean = false) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return showWeekday ? "aujourd'hui" : "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return showWeekday ? "demain" : "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: showWeekday ? 'long' : undefined,
        day: 'numeric',
        month: 'long'
      });
    }
  };

  // Fonction pour obtenir la classe CSS en fonction du statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmé';
      case 'in-progress':
        return 'En cours';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };
  // Rediriger vers la page de rendez-vous avec un service présélectionné
  const handleServiceReservation = (serviceId: number) => {
    navigate(`/appointments?serviceId=${serviceId}&action=new`);
  };

  // Fonction de débogage pour vérifier les rendez-vous
  React.useEffect(() => {
    console.log("État upcomingAppointments:", upcomingAppointments);
    console.log("État services:", services);
    
    if (upcomingAppointments.length > 0) {
      upcomingAppointments.forEach(appointment => {
        const service = services.find(s => s.id === appointment.serviceId);
        console.log(`Rendez-vous #${appointment.id} - Service trouvé:`, service ? "Oui" : "Non", 
          "ServiceId:", appointment.serviceId, 
          "Services disponibles:", services.map(s => s.id));
      });
    }
  }, [upcomingAppointments, services]);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nos prestations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez nos services de qualité et prenez rendez-vous en quelques clics.
          </p>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Rechercher une prestation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="md:w-1/2">
              <select
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Affichage des résultats */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Aucune prestation ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
              >
                <div 
                  className="h-2" 
                  style={{ backgroundColor: getCategoryColor(service.categoryId) }}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${getCategoryColor(service.categoryId)}20`,
                        color: getCategoryColor(service.categoryId)
                      }}
                    >
                      {categories.find(cat => cat.id === service.categoryId)?.name || 'Non catégorisé'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{service.price} €</span>
                      </div>
                    </div>
                      <button 
                      onClick={() => handleServiceReservation(service.id)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Section des prochains rendez-vous */}
        <div className="mt-16 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vos prochains rendez-vous
            </h2>
            <Link to="/appointments" className="text-blue-600 dark:text-blue-400 flex items-center hover:underline">
              Voir tous <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {appointmentsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-md">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun rendez-vous à venir</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous n'avez pas encore de rendez-vous programmés.
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Prendre rendez-vous
              </Link>
            </div>          ) : (            <div className="space-y-8">
              {/* Regrouper les rendez-vous par date */}
              {upcomingAppointments.map((appointment, index, array) => {
                // Vérifier si c'est le premier rendez-vous ou si la date est différente du rendez-vous précédent
                const isNewDate = index === 0 || 
                  formatAppointmentDate(appointment.date) !== formatAppointmentDate(array[index-1].date);
                const service = services.find(s => s.id === appointment.serviceId);
                console.log(`Rendu: Service pour rendez-vous #${appointment.id}:`, service, `serviceId: ${appointment.serviceId}`);
                
                // Obtenir la durée du service
                const serviceDuration = service ? service.duration : 60;
                
                return (                  <div key={appointment.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">                    {isNewDate && (
                      <div className="sticky top-0 z-10">
                        <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/95 dark:to-gray-800 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatAppointmentDate(appointment.date) === formatAppointmentDate(new Date().toISOString()) ? "Aujourd'hui" : formatAppointmentDate(appointment.date)}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {array.filter(a => formatAppointmentDate(a.date) === formatAppointmentDate(appointment.date)).length} 
                            {array.filter(a => formatAppointmentDate(a.date) === formatAppointmentDate(appointment.date)).length > 1 
                              ? ' rendez-vous' 
                              : ' rendez-vous'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6 space-y-6">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all hover:shadow-md">
                        <Link to="/appointments" className="block">
                          <div className="px-6 py-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                                  {service ? service.name : 'Service indisponible'}
                                </p>
                                <p className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                  <span className="truncate">{appointment.clientName || (user ? `${user.firstName} ${user.lastName}` : '')}</span>
                                </p>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <p className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                                  {getStatusText(appointment.status) === "Confirmé" && (
                                    <span className="mr-1.5">
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    </span>
                                  )}
                                  {getStatusText(appointment.status)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between">                              <div className="sm:flex sm:justify-start space-y-2 sm:space-y-0 sm:space-x-6">
                                <div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatAppointmentDate(appointment.date, true)}
                                    </p>
                                  </div>
                                  <div className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    <p>{appointment.time.substring(0, 5)} ({serviceDuration}min)</p>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500">
                                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                    <p>{appointment.clientEmail}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bouton d'actions */}
                              <div className="relative">
                                <button 
                                  type="button"
                                  className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/appointments`);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal h-5 w-5">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                  </svg>
                                </button>
                              </div>
                            </div>
                              {appointment.notes && appointment.notes.trim() !== '' && (
                              <div className="mt-2 sm:flex sm:justify-start">
                                <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 w-full">
                                  <p className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                                  <p className="whitespace-pre-wrap">{appointment.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-12"></div>
      
      </div>
    </PageTransition>
  );
};

export default UserHome;
