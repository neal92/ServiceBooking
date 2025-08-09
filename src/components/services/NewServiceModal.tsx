import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Service, Category } from '../../types';
import { serviceService, categoryService } from '../../services/api';
import ModalPortal from '../layout/ModalPortal';
import ImageUpload from '../ui/ImageUpload';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess?: (message: string, serviceId?: string) => void; // Callback when operation is successful
}

const NewServiceModal = ({ isOpen, onClose, service, onSuccess }: NewServiceModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [categoryId, setCategoryId] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Set form values when editing a service
  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setPrice(service.price.toString());
      setDuration(service.duration.toString());
      setCategoryId(service.categoryId.toString());
      setSelectedImage(null); // Reset image for editing - user will need to upload new one if they want to change it
      
      // Définir l'URL de l'image existante si elle existe
      if (service.image) {
        setExistingImageUrl(`/api/services/${service.id}/image?t=${Date.now()}`);
      } else {
        setExistingImageUrl(null);
      }
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setDuration('60');
      setCategoryId('');
      setSelectedImage(null);
      setExistingImageUrl(null);
    }
  }, [service, isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    console.log('🚀 === FRONTEND - DÉBUT SOUMISSION ===');
    console.log('📝 État selectedImage:', selectedImage);
    console.log('📝 Type de selectedImage:', typeof selectedImage);
    console.log('📝 selectedImage instanceof File:', selectedImage instanceof File);

    try {
      // Préparer les données de base du service
      const baseServiceData = {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        categoryId: parseInt(categoryId)
      };

      // Ajouter l'image si fournie
      const serviceDataWithImage = selectedImage 
        ? { ...baseServiceData, image: selectedImage }
        : baseServiceData;

      console.log('📤 Données envoyées au backend:', {
        ...serviceDataWithImage,
        image: selectedImage ? `File: ${selectedImage.name} (${selectedImage.size} bytes)` : 'Pas d\'image'
      });

      let successMsg = '';
      let serviceId: string | undefined;
      
      if (service && service.id) {
        await serviceService.update(service.id.toString(), serviceDataWithImage);
        successMsg = 'Service modifié avec succès';
        serviceId = service.id.toString();
      } else {
        const result = await serviceService.create(serviceDataWithImage);
        successMsg = 'Service créé avec succès';
        serviceId = result.serviceId;
      }
      
      // Fermer la modale
      onClose();
      
      // Réinitialiser l'état du modal
      if (!service) { // Seulement pour les nouveaux services
        setName('');
        setDescription('');
        setPrice('');
        setDuration('60');
        setCategoryId('');
        setSelectedImage(null);
        setExistingImageUrl(null);
        setError('');
      }
      
      // Appeler le callback onSuccess avec le message et l'ID du service
      if (onSuccess) {
        onSuccess(successMsg, serviceId);
      }
    } catch (err) {
      console.error("Error saving service:", err);
      setError('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  if (!isOpen) return null;
  
  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
        
        {/* Modal content */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-fadeIn mx-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {service ? 'Modifier la prestation' : 'Nouvelle prestation'}
              </h3>
              <button
                type="button"
                className="text-white hover:text-gray-200 transition-colors"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 animate-fadeIn animation-delay-400">
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                    Nom de la prestation <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      placeholder="Ex: Massage relaxant"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      placeholder="Décrivez cette prestation en détail..."
                    ></textarea>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      La description sera visible par vos clients et les aidera à comprendre votre prestation.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="price" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                    Prix (€) <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full pr-12 text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-base">€</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="duration" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                    Durée (minutes) <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="15"
                      step="15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full pr-12 text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-base">min</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="categoryId" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                    Catégorie <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    className="mt-2 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 rounded-md shadow-sm transition-shadow hover:shadow"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {isLoading && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-500 dark:text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement des catégories...
                    </div>
                  )}
                </div>

                {/* Upload d'image */}
                <div className="sm:col-span-6">
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image du service
                  </label>
                  
                  {/* Afficher l'image existante si on modifie un service */}
                  {service && existingImageUrl && !selectedImage && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Image actuelle du service :
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={existingImageUrl}
                          alt={service.name}
                          className="h-32 w-auto rounded-lg shadow-md object-cover"
                          onError={() => setExistingImageUrl(null)}
                        />
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                        Uploadez une nouvelle image pour la remplacer
                      </p>
                    </div>
                  )}
                  
                  <ImageUpload
                    value={selectedImage}
                    onChange={setSelectedImage}
                    accept="image/*"
                    maxSize={5}
                    preview={true}
                    className="w-full"
                    allowManualResize={true}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Redimensionnement automatique ou manuel disponible. L'image sera optimisée pour le web. Formats acceptés : JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="px-6 py-3 mb-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 flex items-center animate-fadeIn">
                <svg className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-105"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : service ? (
                  <>Mettre à jour</>
                ) : (
                  <>Créer la prestation</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NewServiceModal;