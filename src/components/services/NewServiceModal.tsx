import React, { useState, useEffect } from 'react';
import { Service } from '../../types';
import { categoryService } from '../../services/api';
import ModalPortal from '../layout/ModalPortal';
import ImageUpload from '../ui/ImageUpload';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess?: (message: string, serviceId?: string) => void;
}

const NewServiceModal = ({ isOpen, onClose, service, onSuccess }: NewServiceModalProps) => {
  // Ajout des hooks d'état manquants pour le slide et le formulaire
  // Slide logic
  const PRESTATION_CHOICES = ["Manucure", "Beauté", "Cil", "Pédicure", "Massage", "Autre"];
  const PRICE_CHOICES = [15, 25, 35, 45, 55, "Autre"];
  const DURATION_CHOICES = [15, 25, 35, 45, 55, "Autre"];
  const [slideStep, setSlideStep] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomName, setShowCustomName] = useState(false);
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  // On conserve les autres états existants : step, selectedType, isCategoryLoading, etc.
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [categoryId, setCategoryId] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<'homme' | 'femme' | 'mixte' | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const result = await categoryService.getAll();
          setCategories(result || []);
        } catch {
          setCategories([]);
        }
      })();
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
      setStep('form');
    } else {
          setName('');
          setDescription('');
          setPrice('');
          setDuration('');
          setCategoryId('');
          setSelectedImage(null);
          setExistingImageUrl(null);
          setStep('type');
          setSelectedType(null);
          setError('');
        }
      }, [service]);
    
      // Add your handleSubmit function here (if not already present)
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
          // ...submit logic...
          if (onSuccess) onSuccess('Service créé ou mis à jour !');
          onClose();
        } catch (err: any) {
          setError('Erreur lors de la soumission');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      return (
        <ModalPortal isOpen={isOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-fadeIn mx-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
              {step === 'type' ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-bold mb-6 text-center">Voulez-vous créer une prestation pour :</h2>
                  <div className="flex flex-col gap-4 w-full items-center mb-4">
                    <div className="flex flex-row gap-6 w-full justify-center">
                      <button
                        className={`flex flex-col items-center px-6 py-4 rounded-lg border-2 transition-all w-full max-w-xs ${selectedType === 'homme' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'} hover:border-blue-400`}
                        onClick={() => setSelectedType(selectedType === 'homme' ? null : 'homme')}
                        type="button"
                      >
                        <svg className="w-10 h-10 mb-2 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <span className="font-semibold text-lg">Homme</span>
                      </button>
                      <button
                        className={`flex flex-col items-center px-6 py-4 rounded-lg border-2 transition-all w-full max-w-xs ${selectedType === 'femme' ? 'border-pink-600 bg-pink-50 dark:bg-pink-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'} hover:border-pink-400`}
                        onClick={() => setSelectedType(selectedType === 'femme' ? null : 'femme')}
                        type="button"
                      >
                        <svg className="w-10 h-10 mb-2 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <span className="font-semibold text-lg">Femme</span>
                      </button>
                    </div>
                    <div className="flex flex-row w-full justify-center">
                      <button
                        className={`flex flex-col items-center px-6 py-4 rounded-lg border-2 transition-all w-full max-w-xs ${selectedType === 'mixte' ? 'border-teal-600 bg-teal-50 dark:bg-teal-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'} hover:border-teal-400`}
                        onClick={() => setSelectedType(selectedType === 'mixte' ? null : 'mixte')}
                        type="button"
                      >
                        <svg className="w-10 h-10 mb-2 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4v2h5" /><circle cx="12" cy="7" r="4" /></svg>
                        <span className="font-semibold text-lg">Mixte</span>
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 text-center text-gray-700 dark:text-gray-300 text-base">
                    <span>Ce choix créera automatiquement une catégorie selon votre sélection.<br /></span>
                  </div>
                  <button
                    className={`mt-2 px-8 py-3 rounded-lg font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all w-full`}
                    disabled={isCategoryLoading}
                    onClick={async () => {
                      if (!selectedType) {
                        setCategoryId("");
                        setStep('form');
                        setSlideStep(0);
                        return;
                      }
                      setIsCategoryLoading(true);
                      const nameCat = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
                      const descriptionCat = `Prestation ${nameCat}`;
                      const color = 'blue';
                      try {
                        // Vérifier si la catégorie existe déjà
                        const existingCat = categories.find(cat => cat.name.toLowerCase() === nameCat.toLowerCase());
                        if (existingCat) {
                          setCategoryId(existingCat.id.toString());
                          setStep('form');
                          setSlideStep(0);
                        } else {
                          const result = await categoryService.create({ name: nameCat, description: descriptionCat, color });
                          setCategoryId(result.categoryId.toString());
                          setStep('form');
                          setSlideStep(0);
                        }
                      } catch (err) {
                        alert('Erreur lors de la création de la catégorie');
                      } finally {
                        setIsCategoryLoading(false);
                      }
                    }}
                    type="button"
                  >
                    {isCategoryLoading
                      ? 'Création...'
                      : selectedType
                      ? 'Suivant'
                      : 'Passer cette étape'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-120px)] animate-slideIn">
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-6 gap-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Nom de la prestation <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                        placeholder="Ex: Manucure, Beauté, etc."
                        required
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Description <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
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
                        disabled={!!(selectedType && categoryId)}
                      >
                        {!selectedType ? (
                          <>
                            <option value="">Sélectionnez une catégorie</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </>
                        ) : (
                          <option value={categoryId}>
                            {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'Catégorie sélectionnée'}
                          </option>
                        )}
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image du service
                      </label>
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
              )}
            </div>
          </div>
        </ModalPortal>
      );
}

export default NewServiceModal;