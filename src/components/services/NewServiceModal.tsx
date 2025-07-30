import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Service, Category } from '../../types';
import { serviceService, categoryService } from '../../services/api';
import ModalPortal from '../layout/ModalPortal';
// import ImageUpload from '../ui/ImageUpload';  // Temporairement commenté pour éviter l'erreur

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess?: (message: string) => void; // Callback when operation is successful
}

const NewServiceModal = ({ isOpen, onClose, service, onSuccess }: NewServiceModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [categoryId, setCategoryId] = useState('');
  // const [selectedImage, setSelectedImage] = useState<File | null>(null);  // Temporairement commenté
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
      // setSelectedImage(null); // Reset image for editing - Temporairement commenté
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setDuration('60');
      setCategoryId('');
      // setSelectedImage(null);  // Temporairement commenté
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

    try {
      const serviceData = {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        categoryId: parseInt(categoryId)
        // image: selectedImage || undefined  // Temporairement commenté
      };

      let successMsg = '';
      if (service && service.id) {
        await serviceService.update(service.id.toString(), serviceData);
        successMsg = 'Service modifié avec succès';
      } else {
        await serviceService.create(serviceData);
        successMsg = 'Service créé avec succès';
      }
      
      // Fermer la modale
      onClose();
      
      // Appeler le callback onSuccess avec le message
      if (onSuccess) {
        onSuccess(successMsg);
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
                  {/* <ImageUpload
                    onImageChange={setSelectedImage}
                    currentImage={service?.image}
                    placeholder="Ajouter une image pour ce service"
                    imageType="services"
                    enableResize={true}
                  /> */}
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">Upload d'image temporairement désactivé</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    L'image apparaîtra sur la carte du service. Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
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