import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar, ChevronRight, Image as ImageIcon } from 'lucide-react';
import serviceService from '../services/serviceService';
import { Service } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ImageLoader from '../components/ui/ImageLoader';

const BookService: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data as Service[]);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
      setError('Impossible de charger les services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    // Si l'utilisateur est déjà connecté, le rediriger vers l'application
    if (user) {
      navigate(`/app/appointments?action=new&serviceId=${serviceId}&fromBooking=true`);
      return;
    }

    // Si l'utilisateur n'est pas connecté, le rediriger vers l'inscription
    navigate('/register', { 
      state: { 
        selectedServiceId: serviceId,
        userType: 'client',
        fromBooking: true 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour à l'accueil
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-600 dark:text-gray-300">
                    Bonjour, {user.firstName}
                  </span>
                  <Link
                    to="/app"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Mon compte
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {user ? 'Choisissez votre prestation' : 'Réservez votre prestation'}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {user 
              ? 'Sélectionnez le service qui vous intéresse et procédez à la réservation.'
              : 'Découvrez nos services et réservez en quelques clics. Créez votre compte pour accéder à notre système de réservation en ligne.'
            }
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nos Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choisissez le service qui vous convient
            </p>
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* Image du service */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    {service.image && !imageErrors[service.id] ? (
                      <ImageLoader
                        serviceId={service.id}
                        imageName={service.image}
                        useThumbnail={true}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageErrors(prev => ({ ...prev, [service.id]: true }));
                        }}
                      />
                    ) : (
                      /* Placeholder pour les services sans image ou en cas d'erreur */
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{service.price.toFixed(2)} €</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleServiceSelect(service.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {user ? 'Réserver maintenant' : 'Réserver ce service'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {services.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Aucun service disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action - Seulement pour les utilisateurs non connectés */}
      {!user && (
        <section className="bg-gray-100 dark:bg-gray-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Prêt à réserver ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Créez votre compte gratuitement et commencez à réserver vos prestations en ligne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                Créer un compte
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
              <Link
                to="/login"
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BookService;
