import React, { useEffect, useState } from 'react';
import { Calendar, Briefcase, X } from 'lucide-react';
import { getFullMediaUrl } from '../../utils/config';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/image-preload.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfessional: () => void;
  onClient: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onProfessional, onClient }) => {
  const { darkMode } = useTheme();
  // État pour suivre le chargement des images
  const [imagesLoaded, setImagesLoaded] = React.useState({
    client: false,
    professional: false
  });
  // État pour suivre les erreurs d'images
  const [imageErrors, setImageErrors] = useState({
    client: false,
    professional: false
  });

  // Images paths pour préchargement
  const imagePaths = [
    "/images/slides/client.jpg",
    "/images/slides/professional.jpg"
  ];

  // Images de secours en cas d'erreur
  const fallbackImages = {
    client: "/images/slides/calendar-planning.svg",
    professional: "/images/slides/business-meeting.svg"
  };

  // Précharger les images dès que le composant est monté
  useEffect(() => {
    // Préchargement des images même avant l'ouverture du modal
    const preloadImages = () => {
      imagePaths.forEach(path => {
        const img = new Image();
        img.src = getFullMediaUrl(path);
        img.fetchPriority = "high";
        img.onload = () => {
          console.log(`Image préchargée: ${path}`);
          // Mettre à jour l'état de chargement en fonction du chemin
          if (path.includes('client')) {
            setImagesLoaded(prev => ({ ...prev, client: true }));
          } else if (path.includes('professional')) {
            setImagesLoaded(prev => ({ ...prev, professional: true }));
          }
        };
        img.onerror = () => {
          console.error(`❌ Erreur de préchargement: ${path}`);
          // En cas d'erreur, activer l'image de secours
          if (path.includes('client')) {
            setImageErrors(prev => ({ ...prev, client: true }));
            // Essayer l'image de secours
            const fallbackImg = new Image();
            fallbackImg.src = getFullMediaUrl(fallbackImages.client);
            console.log(`🔄 Tentative avec image de secours: ${fallbackImages.client}`);
            fallbackImg.onload = () => {
              console.log(`✅ Image de secours chargée: ${fallbackImages.client}`);
              setImagesLoaded(prev => ({ ...prev, client: true }));
            };
          } else if (path.includes('professional')) {
            setImageErrors(prev => ({ ...prev, professional: true }));
            // Essayer l'image de secours
            const fallbackImg = new Image();
            fallbackImg.src = getFullMediaUrl(fallbackImages.professional);
            console.log(`🔄 Tentative avec image de secours: ${fallbackImages.professional}`);
            fallbackImg.onload = () => {
              console.log(`✅ Image de secours chargée: ${fallbackImages.professional}`);
              setImagesLoaded(prev => ({ ...prev, professional: true }));
            };
          }
        };
      });
    };

    preloadImages();
  }, []);

  // Précharger à nouveau et optimiser quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      // Force le chargement prioritaire des images quand le modal est ouvert
      imagePaths.forEach(path => {
        const fullUrl = getFullMediaUrl(path);

        // Utiliser à la fois l'API Image et une image cachée dans le DOM
        const img = new Image();
        img.src = fullUrl;
        img.fetchPriority = "high";

        // Ajouter au cache du navigateur pour un accès plus rapide
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fullUrl;
        link.as = 'image';
        document.head.appendChild(link);

        // Nettoyer après chargement
        setTimeout(() => {
          document.head.removeChild(link);
        }, 2000);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choisissez votre profil
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sélectionnez le type de compte qui correspond à vos besoins
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Option Client */}          <button
            onClick={onClient}
            className="relative bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-0 overflow-hidden text-center hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
            style={{ height: "280px" }}
          >
            {/* Fond de couleur pour éviter un flash blanc pendant le chargement */}
            <div className="absolute inset-0 bg-blue-900/40"></div>

            {/* Indicateur de chargement */}
            {!imagesLoaded.client && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spinner"></div>
              </div>
            )}

            {/* Image avec optimisations */}
            <div
              className={`absolute inset-0 w-full h-full bg-cover bg-center preload-bg-image bg-image-container ${imagesLoaded.client ? 'loaded' : ''}`}
              style={{
                backgroundImage: `url('${getFullMediaUrl(imageErrors.client ? fallbackImages.client : "/images/slides/client.jpg")}')`
              }}
            >
              {/* Image réelle cachée pour forcer le chargement prioritaire */}
              <img
                src={getFullMediaUrl(imageErrors.client ? fallbackImages.client : "/images/slides/client.jpg")}
                alt="Profil client"
                className="hidden"
                loading="eager"
                fetchPriority="high"
                onLoad={(e) => {
                  console.log('✅ Image client chargée avec succès');
                  // S'assurer que l'image de fond est chargée
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.opacity = '1';
                  // Marquer cette image comme chargée
                  setImagesLoaded(prev => ({ ...prev, client: true }));
                }}
                onError={(e) => {
                  console.error('❌ Erreur lors du chargement de l\'image client');
                  setImageErrors(prev => ({ ...prev, client: true }));
                  // Utiliser l'image de secours
                  e.currentTarget.src = getFullMediaUrl(fallbackImages.client);
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/20 transition-colors duration-300"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg sm:text-xl font-bold">Je suis client</h3>
              <p className="mt-1 text-sm text-gray-200">
                Je souhaite réserver des services
              </p>
            </div>

            <div className="absolute top-3 right-3 h-10 w-10 bg-blue-100 dark:bg-blue-900/70 rounded-full flex items-center justify-center shadow-md">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </button>

          {/* Option Professionnel */}
          <button
            onClick={onProfessional}
            className="relative bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-0 overflow-hidden text-center hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
            style={{ height: "280px" }}
          >
            {/* Fond de couleur pour éviter un flash blanc pendant le chargement */}
            <div className="absolute inset-0 bg-blue-900/40"></div>

            {/* Indicateur de chargement */}
            {!imagesLoaded.professional && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spinner"></div>
              </div>
            )}

            {/* Image avec optimisations */}
            <div
              className={`absolute inset-0 w-full h-full bg-cover bg-center preload-bg-image bg-image-container ${imagesLoaded.professional ? 'loaded' : ''}`}
              style={{
                backgroundImage: `url('${getFullMediaUrl(imageErrors.professional ? fallbackImages.professional : "/images/slides/professional.jpg")}')`
              }}
            >
              {/* Image réelle cachée pour forcer le chargement prioritaire */}
              <img
                src={getFullMediaUrl(imageErrors.professional ? fallbackImages.professional : "/images/slides/professional.jpg")}
                alt="Profil professionnel"
                className="hidden"
                loading="eager"
                fetchPriority="high"
                onLoad={(e) => {
                  console.log('✅ Image professionnel chargée avec succès');
                  // S'assurer que l'image de fond est chargée
                  const parent = e.currentTarget.parentElement;
                  if (parent) parent.style.opacity = '1';
                  // Marquer cette image comme chargée
                  setImagesLoaded(prev => ({ ...prev, professional: true }));
                }}
                onError={(e) => {
                  console.error('❌ Erreur lors du chargement de l\'image professionnel');
                  setImageErrors(prev => ({ ...prev, professional: true }));
                  // Utiliser l'image de secours
                  e.currentTarget.src = getFullMediaUrl(fallbackImages.professional);
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-blue-600/0 hover:bg-blue-600/20 transition-colors duration-300"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg sm:text-xl font-bold">Je suis professionnel</h3>
              <p className="mt-1 text-sm text-gray-200">
                Je propose des services
              </p>
            </div>

            <div className="absolute top-3 right-3 h-10 w-10 bg-blue-100 dark:bg-blue-900/70 rounded-full flex items-center justify-center shadow-md">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Déjà inscrit ?{' '}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
