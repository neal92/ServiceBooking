import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface ImageResizerProps {
  imageFile: File;
  onImageProcessed: (processedFile: File) => void;
  onClose: () => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const ImageResizer: React.FC<ImageResizerProps> = ({
  imageFile,
  onImageProcessed,
  onClose,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      // Calculer l'échelle initiale pour adapter l'image
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const initialScale = Math.min(scaleX, scaleY, 1);
      setScale(initialScale);
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile, maxWidth, maxHeight]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const processImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculer les dimensions finales
    let finalWidth = originalImage.width * scale;
    let finalHeight = originalImage.height * scale;

    // Si l'image est en rotation de 90° ou 270°, inverser les dimensions
    if (rotation === 90 || rotation === 270) {
      [finalWidth, finalHeight] = [finalHeight, finalWidth];
    }

    // Limiter aux dimensions maximales
    if (finalWidth > maxWidth || finalHeight > maxHeight) {
      const scaleDown = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
      finalWidth *= scaleDown;
      finalHeight *= scaleDown;
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // Nettoyer le canvas
    ctx.clearRect(0, 0, finalWidth, finalHeight);
    
    // Sauvegarder l'état du contexte
    ctx.save();

    // Déplacer l'origine au centre du canvas
    ctx.translate(finalWidth / 2, finalHeight / 2);
    
    // Appliquer la rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Dessiner l'image centrée
    const drawWidth = originalImage.width * scale;
    const drawHeight = originalImage.height * scale;
    ctx.drawImage(
      originalImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    // Restaurer l'état du contexte
    ctx.restore();

    // Convertir en blob puis en File
    canvas.toBlob((blob) => {
      if (blob) {
        const processedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now(),
        });
        onImageProcessed(processedFile);
      }
    }, imageFile.type, quality);
  };

  const handleSave = () => {
    processImage();
    onClose();
  };

  const downloadPreview = () => {
    if (!canvasRef.current) return;
    
    processImage();
    
    const link = document.createElement('a');
    link.download = `resized_${imageFile.name}`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Redimensionner l'image
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Aperçu de l'image */}
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Aperçu"
                    className="max-w-full max-h-[400px] object-contain"
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Contrôles */}
            <div className="lg:w-64 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Échelle: {(scale * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleZoomOut}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                  Zoom -
                </button>
                <button
                  onClick={handleZoomIn}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                  Zoom +
                </button>
              </div>

              <button
                onClick={handleRotate}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Rotation ({rotation}°)
              </button>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Taille originale: {originalImage?.width}×{originalImage?.height}</div>
                  <div>Taille finale: {Math.round((originalImage?.width || 0) * scale)}×{Math.round((originalImage?.height || 0) * scale)}</div>
                  <div>Limite: {maxWidth}×{maxHeight}</div>
                </div>
              </div>

              <button
                onClick={downloadPreview}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger aperçu
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Appliquer
          </button>
        </div>

        {/* Canvas caché pour le traitement */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageResizer;
