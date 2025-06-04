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
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Catégories
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-6">
          <div className="spinner"></div>
          <p className="mt-2">Chargement des catégories...</p>
        </div>
      ) : (
        /* Categories List */
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {categories.length === 0 ? (
            <p className="text-center py-6 text-gray-500">Aucune catégorie trouvée</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white bg-${category.color || 'blue'}-500`}>
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{category.servicesCount || 0} prestations dans cette catégorie</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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