import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Crop } from 'lucide-react';
import ImageCropper from './ImageCropper';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // en MB
  preview?: boolean;
  className?: string;
  disabled?: boolean;
  allowManualResize?: boolean; // Nouvelle option pour le redimensionnement manuel
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  accept = "image/*",
  maxSize = 10, // Augmenté à 10MB car les images seront redimensionnées côté serveur
  preview = true,
  className = "",
  disabled = false,
  allowManualResize = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Générer l'URL de prévisualisation quand un fichier est sélectionné
  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return 'Seuls les fichiers image sont autorisés';
    }

    // Vérifier la taille
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `La taille du fichier ne doit pas dépasser ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    
    // Si le redimensionnement manuel est activé, ouvrir le cropper
    if (allowManualResize) {
      setFileToProcess(file);
      setShowCropper(true);
    } else {
      onChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    setShowCropper(false);
    setFileToProcess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gestion du cropper
  const handleCropperSave = (croppedFile: File) => {
    onChange(croppedFile);
    setShowCropper(false);
    setFileToProcess(null);
    // La preview se mettra à jour automatiquement via l'effet de value
  };

  const handleCropperCancel = () => {
    setShowCropper(false);
    setFileToProcess(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-2">
        {/* Zone de upload */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragOver && !disabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400 hover:bg-gray-50'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          {preview && previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Aperçu"
                className="max-w-full max-h-48 rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                {isDragOver ? (
                  <Upload className="h-12 w-12 text-blue-500" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">
                  {isDragOver
                    ? 'Relâchez pour télécharger'
                    : 'Cliquez ou glissez-déposez une image'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG, GIF, WebP jusqu'à {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informations sur le fichier sélectionné */}
        {value && !previewUrl && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <ImageIcon size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700 truncate">
                {value.name}
              </span>
              <span className="text-xs text-gray-500">
                ({(value.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {allowManualResize && (
                <button
                  type="button"
                  onClick={() => {
                    setFileToProcess(value);
                    setShowCropper(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                  title="Redimensionner"
                  disabled={disabled}
                >
                  <Crop size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-500 hover:text-red-700 transition-colors"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Bouton de redimensionnement pour les images avec aperçu */}
        {allowManualResize && value && previewUrl && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setFileToProcess(value);
                setShowCropper(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={disabled}
            >
              <Crop size={16} />
              Redimensionner
            </button>
          </div>
        )}
      </div>

      {/* Composant de recadrage/redimensionnement */}
      {showCropper && fileToProcess && (
        <ImageCropper
          file={fileToProcess}
          onSave={handleCropperSave}
          onCancel={handleCropperCancel}
          aspectRatio={4/3}
          maxWidth={800}
          maxHeight={600}
        />
      )}
    </div>
  );
};

export default ImageUpload;