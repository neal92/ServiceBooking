import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash, Search, Tag } from 'lucide-react';
import { Category } from '../types';
import NewCategoryModal from '../components/categories/NewCategoryModal';
import { categoryService } from '../services/api';
import PageTransition from '../components/layout/PageTransition';
import ModalPortal from '../components/layout/ModalPortal';
import SuccessToast from '../components/layout/SuccessToast';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      
      // Nettoyer les données pour éviter les erreurs
      const validCategories = data.map(cat => ({
        ...cat,
        id: Number(cat.id),
        name: cat.name || '',
        description: cat.description || '',
        servicesCount: cat.servicesCount || 0
      }));
      
      setCategories(validCategories);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
    // Refresh categories after closing modal
    fetchCategories();
  };
  
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    
    // Hide the toast after 5 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };
  
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        // Convertir l'id en chaîne pour l'API
        await categoryService.delete(categoryToDelete.id.toString());
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
        
        // Afficher le message de succès après la suppression
        showSuccess(`La catégorie ${categoryToDelete.name} a été supprimée avec succès`);
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };
    return (
    <PageTransition type="slide">
      <div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg mb-8 p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-4 -mr-16 opacity-10">
            <Tag className="h-64 w-64 text-white" />
          </div>
        <div className="md:flex md:items-center md:justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl">
              Catégories
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Gérez les catégories de services que vous proposez
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nouvelle catégorie
            </button>
          </div>
        </div>
      </div>      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-md shadow">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
        {/* Search Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-5 shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fadeIn">
        <label htmlFor="categorySearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rechercher une catégorie
        </label>
        <div className="relative rounded-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="categorySearch"
            id="categorySearch"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm transition-shadow duration-200 hover:shadow-md"
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Chargement des catégories...</p>
        </div>
      ) : (
        /* Categories List */
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          {categories.length === 0 || categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
          ).length === 0 ? (            <div className="flex flex-col items-center justify-center py-16 bg-blue-50 dark:bg-blue-900/10 animate-fadeIn">
              <div className="bg-blue-100 dark:bg-blue-800 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                <Tag className="h-12 w-12 text-blue-500 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune catégorie trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-center">
                {searchTerm 
                  ? `Aucune catégorie ne correspond à votre recherche "${searchTerm}". Essayez d'autres termes ou créez une nouvelle catégorie.` 
                  : "Vous n'avez pas encore créé de catégories. Commencez par en ajouter une nouvelle !"}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-5 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Créer une catégorie
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {categories
                .filter(category => 
                  category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((category) => (                <div 
                  key={category.id}
                  onClick={() => handleEditCategory(category)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fadeIn cursor-pointer transform group"
                >
                  <div className={`w-full h-2 bg-${category.color || 'blue'}-500 transition-all duration-300 group-hover:h-3`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white bg-${category.color || 'blue'}-500 font-bold text-lg shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{category.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:bg-${category.color || 'blue'}-100 dark:group-hover:bg-${category.color || 'blue'}-900/30 group-hover:text-${category.color || 'blue'}-600 dark:group-hover:text-${category.color || 'blue'}-400`}>
                              {category.servicesCount || 0} prestations
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{category.description}</p>
                    
                    <div className="flex justify-between items-center mt-auto">                    <span className="text-xs text-gray-400 dark:text-gray-500 italic group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">Cliquez pour modifier</span>
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche l'événement de remonter à la carte
                            handleEditCategory(category);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Modifier
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche l'événement de remonter à la carte
                            handleDeleteClick(category);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 dark:border-red-700 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}      <NewCategoryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        category={editingCategory}
        onSuccess={showSuccess}
      />
      
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && (
        <ModalPortal isOpen={isDeleteModalOpen}>            <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={handleCancelDelete}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fadeIn" style={{ maxHeight: 'calc(100vh - 40px)' }}>
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">Confirmer la suppression</h3>
                <p className="mb-5 text-gray-600 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer la catégorie <strong className="text-gray-700 dark:text-gray-300">{categoryToDelete?.name}</strong> ?
                  {categoryToDelete?.servicesCount ? (
                    <span className="block mt-2 text-amber-600 dark:text-amber-500 font-medium">
                      Cette catégorie contient {categoryToDelete.servicesCount} prestation(s). Leur catégorie sera réinitialisée.
                    </span>
                  ) : null}
                </p>
              
                <div className="flex justify-center gap-4 mt-6">                  <button
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
      )}      </div>
      
      {/* Toast de succès */}      <SuccessToast 
        show={showSuccessToast} 
        message={successMessage} 
      />
    </PageTransition>
  );
};

export default Categories;