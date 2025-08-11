import React from 'react';
import ImageLoader from '../components/ui/ImageLoader';
import { CheckCircle, X } from 'lucide-react';

interface ServiceDetailModalProps {
  service: {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
    image?: string;
  };
  onClose: () => void;
  onReserve?: (service: { id: number; name: string; description: string; duration: number; price: number; image?: string }) => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose, onReserve }) => {
  // Aucun effet sur le scroll du body
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden relative animate-fadeIn flex flex-col justify-center items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col md:flex-row">
          {/* Image à gauche */}
          <div className="md:w-1/2 w-full h-64 md:h-auto relative flex items-center justify-center overflow-hidden">
            {/* Image en fond */}
            <ImageLoader
              serviceId={service.id}
              imageName={service.image}
              alt={service.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Overlay pour effet sombre */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            {/* Card réduite au centre */}
            <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-4/5 max-w-xs mx-auto flex items-center justify-center">
              <ImageLoader
                serviceId={service.id}
                imageName={service.image}
                alt={service.name}
                className="w-full h-40 object-cover rounded-xl shadow"
              />
            </div>
          </div>
          {/* Description à droite */}
          <div className="md:w-1/2 w-full p-8 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{service.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{service.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-base shadow">
                {service.duration} min
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold text-base shadow">
                {service.price} €
              </span>
            </div>
            <button
              onClick={() => {
                if (typeof onReserve === 'function') onReserve(service);
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Réserver cette prestation
            </button>
            {/* Conditions de réservation */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Conditions de réservation</h3>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>Annulation gratuite jusqu'à 24h avant le rendez-vous</li>
                <li>Arriver 5 minutes avant l'heure prévue</li>
                <li>Le paiement s'effectue sur place ou en ligne selon le service</li>
                <li>En cas de retard, la prestation pourra être écourtée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;
