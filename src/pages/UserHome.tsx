import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, CheckCircle, Search } from 'lucide-react';
import { Service, Category } from '../types';
import { serviceService, categoryService } from '../services/api';
import { Link } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';

const UserHome: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
                    
                    <Link 
                      to="/appointments"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Appel à l'action */}
        <div className="mt-12 text-center">
          <Link
            to="/appointments"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserHome;
