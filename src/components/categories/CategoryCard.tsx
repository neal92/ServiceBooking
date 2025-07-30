import { Edit, Trash, Tag, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
  const getColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      teal: 'bg-teal-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
    };
    return colorMap[color || 'blue'] || 'bg-blue-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      {/* Image de la catégorie */}
      <div className="relative h-32 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {category.image ? (
          <img
            src={`/images/categories/${category.image}`}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si l'image ne se charge pas, masquer l'élément img et afficher le placeholder
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Placeholder pour les catégories sans image */}
        <div 
          className={`w-full h-full flex items-center justify-center ${category.image ? 'hidden' : 'flex'}`}
          style={{ display: category.image ? 'none' : 'flex' }}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Bande colorée */}
        <div className={`absolute bottom-0 left-0 right-0 h-2 ${getColorClass(category.color)}`}></div>
        
        {/* Actions en overlay */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button 
            onClick={onEdit}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-full hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all backdrop-blur-sm"
            title="Modifier"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all backdrop-blur-sm"
            title="Supprimer"
          >
            <Trash className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {category.name}
            </h3>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Tag className="h-3 w-3 mr-1" />
              {category.servicesCount || 0} service{(category.servicesCount || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {category.description && (
          <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {category.description}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className={`w-4 h-4 rounded-full ${getColorClass(category.color)}`}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {category.color || 'blue'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
