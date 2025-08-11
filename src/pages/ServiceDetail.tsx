import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceService } from '../services/api';
import ImageLoader from '../components/ui/ImageLoader';
import { CheckCircle } from 'lucide-react';

// Define the type for a service (adjust fields as needed)
type Service = {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
};

// Define the context type
type ServicesContextType = {
  services: Service[];
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        if (!id) throw new Error('ID manquant');
        const result = await serviceService.getById(id);
        setService(result);
        setError(null);
      } catch (err) {
        setError('Service introuvable.');
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error || !service) return <div className="p-8 text-center">{error || 'Service introuvable.'}</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Image à gauche */}
        <div className="md:w-1/2 w-full h-80 md:h-auto flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <ImageLoader
            serviceId={service.id}
            imageName={service.image}
            alt={service.name}
            className="w-full h-full object-cover rounded-l-xl"
          />
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
            onClick={() => navigate(`/book/${service.id}`)}
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
  );
};

export default ServiceDetail;
