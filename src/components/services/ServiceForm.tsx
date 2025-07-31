import React, { useState } from 'react';
// import ImageUpload from '../ui/ImageUpload';  // Temporairement commenté pour éviter l'erreur

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  categoryId: string;
  image?: File | null;
}

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => void;
  categories: Array<{ id: number; name: string }>;
  initialData?: Partial<ServiceFormData>;
  isEditing?: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ 
  onSubmit, 
  categories, 
  initialData = {},
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || '',
    duration: initialData.duration || '',
    categoryId: initialData.categoryId || '',
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* Temporairement commenté car ImageUpload est désactivé
  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration || !formData.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du service *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Coupe homme"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Décrivez le service..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Prix (€) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Durée (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Temporairement commenté pour éviter l'erreur
      <ImageUpload
        onImageChange={handleImageChange}
        placeholder="Ajouter une image pour ce service"
        imageType="services"
        enableResize={true}
      />
      */}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
