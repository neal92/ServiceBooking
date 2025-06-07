import React from 'react';
import { Edit, Trash, Clock, Tag, Calendar as CalendarIcon } from 'lucide-react';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  return (    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="h-2 bg-teal-500 dark:bg-teal-600"></div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
              <Tag className="h-3 w-3 mr-1" />
              {service.categoryName || 'Sans catégorie'}
            </div>
          </div>
          <div className="flex space-x-1">            <button 
              onClick={onEdit}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Supprimer"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 min-h-[3rem]">
            {service.description || <span className="italic text-gray-400 dark:text-gray-500">Aucune description</span>}
          </p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.duration} min</span>
          </div>
          
          <div className="flex items-center justify-end bg-teal-50 dark:bg-teal-900/30 rounded-lg p-2">
            <span className="text-base font-bold text-teal-700 dark:text-teal-300">{service.price}€</span>
          </div>
        </div>
          <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>Disponible sur rendez-vous</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;