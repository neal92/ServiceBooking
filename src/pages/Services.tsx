import { useState, useEffect } from 'react';
import { PlusCircle, Search, ShoppingBag, Trash } from 'lucide-react';
import ServiceCard from '../components/services/ServiceCard';
import NewServiceModal from '../components/services/NewServiceModal';
import { Service, Category } from '../types';
import { serviceService, categoryService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';
import ModalPortal from '../components/layout/ModalPortal';

const Services = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch services and categories in parallel
      const [servicesData, categoriesData] = await Promise.all([
        serviceService.getAll(),
        categoryService.getAll()
      ]);
      
      setServices(servicesData);
      setCategories(categoriesData);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load services or categories');
      setLoading(false);
    }
  };  
  
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      try {
        // Convertir l'id en chaîne pour l'API
        await serviceService.delete(serviceToDelete.id.toString());
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
        // Refresh services after deletion
        fetchData();
      } catch (err) {
        console.error("Error deleting service:", err);
        setError('Failed to delete service');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setIsModalOpen(false);
    // Refresh services after modal close
    fetchData();
  };
  
  // S'assurer que tous les services ont des valeurs valides
  const validServices = services.map(service => ({
    ...service,
    description: service.description || '',
    categoryId: Number(service.categoryId),
    id: Number(service.id),
    price: Number(service.price),
    duration: Number(service.duration)
  }));
  
  const filteredServices = validServices.filter(
    service => 
      (selectedCategoryId ? service.categoryId === selectedCategoryId : true) &&
      (searchTerm ? 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );  
  
  return (
    <PageTransition type="slideBottom">
      <div>
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl shadow-lg mb-8 p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-10">
            <ShoppingBag className="h-64 w-64 text-white" />
          </div>
          <div className="md:flex md:items-center md:justify-between relative z-10">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl">
                Mes Prestations
              </h2>
              <p className="mt-1 text-sm text-teal-100">
                Gérez les services que vous proposez à vos clients
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-teal-700 bg-white hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              >
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Nouvelle prestation
              </button>
            </div>
          </div>
        </div>
          {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-md shadow flex items-center">
            <svg className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
          {/* Search and Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-5 shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rechercher une prestation
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-teal-500" aria-hidden="true" />
                </div>                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm transition-shadow duration-200 hover:shadow-md"
                  placeholder="Nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:w-1/3">              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrer par catégorie
              </label>
              <select
                id="category"
                name="category"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md shadow-sm transition-shadow duration-200 hover:shadow-md"
                value={selectedCategoryId ? selectedCategoryId.toString() : ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
          {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 dark:border-teal-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Chargement des prestations...</p>
          </div>
        ) : (
          /* Services Grid */
          <>
            {filteredServices.length === 0 ? (              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-teal-500 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune prestation trouvée</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                  {searchTerm || selectedCategoryId 
                    ? 'Aucune prestation ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                    : 'Vous n\'avez pas encore créé de prestations. Commencez par en ajouter une nouvelle !'}
                </p>
                {!searchTerm && !selectedCategoryId && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-5 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150"
                    >
                      <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Créer une prestation
                    </button>
                  </div>
                )}
              </div>
            ) : (              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium leading-none text-center bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded-full mr-3">
                      {filteredServices.length}
                    </span>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      {filteredServices.length === 1 ? 'prestation trouvée' : 'prestations trouvées'}
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onEdit={() => handleEditService(service)} 
                      onDelete={() => handleDeleteClick(service)} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <NewServiceModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          service={editingService}
        />
        
        {/* Modal de confirmation de suppression */}
        {isDeleteModalOpen && (
          <ModalPortal isOpen={isDeleteModalOpen}>              <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
              <div className="fixed inset-0 bg-black bg-opacity-40" onClick={handleCancelDelete}></div>
              
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fadeIn" style={{ maxHeight: 'calc(100vh - 40px)' }}>
                <div className="p-6 text-center">
                  <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Confirmer la suppression</h3>
                  <p className="mb-5 text-gray-600 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer la prestation <strong className="text-gray-700 dark:text-gray-300">{serviceToDelete?.name}</strong> ?
                  </p>
                
                  <div className="flex justify-center gap-4 mt-6">                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="py-2 px-5 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      className="py-2 px-5 text-white bg-red-600 dark:bg-red-700 border border-red-600 dark:border-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 transition-all duration-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </PageTransition>
  );
};

export default Services;
