import React from 'react';
import { Edit, Trash, Clock } from 'lucide-react';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-blue-600">{service.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{service.category}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-all">
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
        </div>
        
        <div className="mt-5 flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-500">{service.duration} min</span>
          </div>
          <div>
            <span className="text-lg font-medium text-gray-900">{service.price}€</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;