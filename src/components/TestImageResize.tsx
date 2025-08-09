import { useState } from 'react';
import ImageUpload from '../components/ui/ImageUpload';

const TestImageResize = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test du Redimensionnement d'Images</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload avec redimensionnement automatique</h2>
          <ImageUpload
            value={selectedImage}
            onChange={setSelectedImage}
            allowManualResize={false}
            maxSize={10}
            preview={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Upload avec redimensionnement manuel</h2>
          <ImageUpload
            value={selectedImage}
            onChange={setSelectedImage}
            allowManualResize={true}
            maxSize={10}
            preview={true}
          />
          <p className="text-sm text-gray-600 mt-2">
            Cliquez sur l'icône de recadrage ou le bouton "Redimensionner" pour ouvrir l'éditeur
          </p>
        </div>

        {selectedImage && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Image sélectionnée :</h3>
            <p className="text-sm text-gray-600">
              Nom: {selectedImage.name}<br/>
              Taille: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB<br/>
              Type: {selectedImage.type}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestImageResize;
