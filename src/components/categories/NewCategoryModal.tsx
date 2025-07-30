import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from '../../types';
import ModalPortal from '../layout/ModalPortal';
// import ImageUpload from '../ui/ImageUpload';  // Temporairement commenté pour éviter l'erreur
import categoryServiceWithImages from '../../services/categoryService';

// Extended Category interface with color field for UI purposes
interface CategoryWithColor extends Category {
  color?: string;
}

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryWithColor | null;
  onSuccess?: (message: string) => void;
}

const colors = [
  { name: 'blue', value: 'blue' },
  { name: 'teal', value: 'teal' },
  { name: 'green', value: 'green' },
  { name: 'purple', value: 'purple' },
  { name: 'pink', value: 'pink' },
  { name: 'red', value: 'red' },
  { name: 'orange', value: 'orange' },
];

const NewCategoryModal = ({ isOpen, onClose, category, onSuccess }: NewCategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setColor(category.color || 'blue');
      setSelectedImage(null); // Reset image for editing
    } else {
      setName('');
      setDescription('');
      setColor('blue');
      setSelectedImage(null);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const categoryData = {
        name,
        description,
        color,
        image: selectedImage || undefined
      };

      let successMsg = '';
      if (category && category.id) {
        await categoryServiceWithImages.update({
          ...categoryData,
          id: category.id
        });
        successMsg = 'Catégorie modifiée avec succès';
      } else {
        await categoryServiceWithImages.create(categoryData);
        successMsg = 'Catégorie créée avec succès';
      }
      
      // Fermer la modale
      onClose();
      
      // Appeler le callback onSuccess avec le message
      if (onSuccess) {
        onSuccess(successMsg);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Échec de l\'enregistrement de la catégorie. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">        {/* Overlay semi-transparent */}
        <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
        
        {/* Modal content */}
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-fadeIn mx-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-600">
            <h3 className="text-xl font-semibold text-white animate-fadeIn">
              {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <button
              type="button"
              className="text-white hover:text-gray-100 transition-colors duration-200"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-120px)] dark:text-gray-100">
            <div className="px-4 py-5">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 animate-fadeIn animation-delay-400">
                <div className="sm:col-span-6">                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom de la catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="mt-1">                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full text-base py-3 px-4 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-shadow hover:shadow"
                      placeholder="Description de la catégorie..."
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Une bonne description permettra de mieux organiser vos prestations.
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Couleur
                  </label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {colors.map((c) => (
                      <div 
                        key={c.value}
                        className="relative"
                        onClick={() => setColor(c.value)}
                      >
                        <div
                          className={`h-10 w-10 rounded-full bg-${c.value}-500 cursor-pointer transform transition-transform duration-200 ${
                            color === c.value 
                              ? 'ring-4 ring-offset-2 ring-purple-300 scale-110' 
                              : 'hover:scale-105'
                          }`}
                        ></div>
                        {color === c.value && (                          <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow">
                            <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload d'image */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image de la catégorie
                  </label>
                  {/* Temporairement commenté pour éviter l'erreur
                  <ImageUpload
                    onImageChange={setSelectedImage}
                    currentImage={category?.image}
                    placeholder="Ajouter une image pour cette catégorie"
                    imageType="categories"
                    enableResize={true}
                  />
                  */}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    L'image apparaîtra sur la carte de la catégorie. Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mx-4 mb-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative animate-fadeIn">
                {error}
              </div>
            )}
            
            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">              <button
                type="button"
                className="mr-3 inline-flex justify-center py-3 px-6 border border-gray-300 dark:border-gray-600 shadow-sm text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
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
                ) : category ? (
                  'Mettre à jour'
                ) : (
                  'Créer la catégorie'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NewCategoryModal;