import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { Category } from '../types';
import NewCategoryModal from '../components/categories/NewCategoryModal';
import { categoryService } from '../services/api';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        // Convertir l'id en chaîne pour l'API
        await categoryService.delete(id.toString());
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
      }
    }
  };
  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg mb-8 p-6">
        <div className="md:flex md:items-center md:justify-between">
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
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des catégories...</p>
        </div>
      ) : (
        /* Categories List */
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-500">Aucune catégorie trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className={`w-full h-2 bg-${category.color || 'blue'}-500`}></div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white bg-${category.color || 'blue'}-500 font-bold text-lg shadow-sm`}>
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              {category.servicesCount || 0} prestations
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2">{category.description}</p>
                    
                    <div className="flex justify-end space-x-3 mt-auto">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <NewCategoryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        category={editingCategory}
      />
    </div>
  );
};

export default Categories;