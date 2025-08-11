import React from 'react';
import { Edit, Trash, Clock, Tag, Calendar as CalendarIcon, Image as ImageIcon } from 'lucide-react';
import { Service } from '../../types';
import { useState } from 'react';
import ImageLoader from '../ui/ImageLoader';

interface ServiceCardProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  useThumbnail?: boolean; // Option pour utiliser le thumbnail (plus petit, plus rapide)
  forceImageRefresh?: boolean; // Force le rechargement de l'image
}

const ServiceCard = ({ service, onEdit, onDelete, useThumbnail = false, forceImageRefresh = false }: ServiceCardProps) => {
  const [showImageError, setShowImageError] = useState(false);

  // Debug: log de l'image reçue
  console.log('[ServiceCard] service.image:', service.image);

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
      {/* Image du service - HAUTEUR AUGMENTÉE pour admin */}
      <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {service.image && !showImageError ? (
          <ImageLoader
            serviceId={service.id}
            imageName={service.image}
            useThumbnail={useThumbnail}
            forceRefresh={forceImageRefresh}
            alt={service.name}
            className="w-full h-full object-cover"
            onError={() => setShowImageError(true)}
          />
        ) : null}
        {/* Placeholder pour les services sans image ou en cas d'erreur */}
        <div 
          className={`w-full h-full flex items-center justify-center ${service.image && !showImageError ? 'hidden' : 'flex'}`}
          style={{ display: service.image && !showImageError ? 'none' : 'flex' }}
        >
          <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        </div>
        {/* Bande colorée - plus fine */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 dark:bg-teal-600"></div>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{service.name}</h3>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
              <Tag className="h-2.5 w-2.5 mr-1" />
              <span className="truncate max-w-[100px]">{service.categoryName || 'Sans catégorie'}</span>
            </div>
          </div>
          <div className="flex space-x-0.5 ml-2">
            <button 
              onClick={onEdit}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
              title="Modifier"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Supprimer"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description - plus compacte */}
        {service.description && (
          <div className="mb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {service.description}
            </p>
          </div>
        )}
        
        {/* Prix et durée - layout plus compact */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-teal-600 dark:text-teal-400 mr-1" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{service.duration}min</span>
          </div>
          
          <div className="flex items-center bg-teal-50 dark:bg-teal-900/30 rounded-md px-2 py-1">
            <span className="text-sm font-bold text-teal-700 dark:text-teal-300">{service.price}€</span>
          </div>
        </div>

        {/* Info disponibilité - plus petite */}
        <div className="mt-2 flex items-center text-[10px] text-gray-500 dark:text-gray-400">
          <CalendarIcon className="h-2.5 w-2.5 mr-1" />
          <span>Sur rendez-vous</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;