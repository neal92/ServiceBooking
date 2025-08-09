import React, { useState, useRef, useCallback } from 'react';
import { X, RotateCcw, Download, Crop } from 'lucide-react';

interface ImageCropperProps {
  file: File;
  onSave: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // largeur/hauteur (ex: 4/3 pour 400x300)
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  file,
  onSave,
  onCancel,
  aspectRatio = 4/3, // Par défaut 400x300
  maxWidth = 400,
  maxHeight = 300,
  maintainAspectRatio = true
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [customWidth, setCustomWidth] = useState(maxWidth);
  const [customHeight, setCustomHeight] = useState(maxHeight);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Presets de dimensions
  const presets = [
    { name: 'Square', width: 300, height: 300, ratio: 1 },
    { name: 'Standard', width: 400, height: 300, ratio: 4/3 },
    { name: 'Wide', width: 600, height: 300, ratio: 2 },
    { name: 'Portrait', width: 300, height: 400, ratio: 3/4 },
  ];

  // Charger l'image
  React.useEffect(() => {
    if (!file) return;
    
    let mounted = true;
    let currentUrl: string | null = null;
    
    const loadImage = async () => {
      try {
        // Créer l'URL blob
        currentUrl = URL.createObjectURL(file);
        setImageUrl(currentUrl);
        
        // Attendre un petit délai pour s'assurer que l'URL est bien créée
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!mounted) return;
        
        const img = new Image();
        
        img.onload = () => {
          if (!mounted) return;
          
          setImageDimensions({ width: img.width, height: img.height });
          
          // Calculer la zone de crop initiale centrée
          const cropWidth = Math.min(img.width, maxWidth);
          const cropHeight = maintainAspectRatio ? cropWidth / aspectRatio : Math.min(img.height, maxHeight);
          
          setCropArea({
            x: (img.width - cropWidth) / 2,
            y: (img.height - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight
          });
          
          setCustomWidth(cropWidth);
          setCustomHeight(cropHeight);
        };
        
        img.onerror = (error) => {
          console.error('Erreur lors du chargement de l\'image blob:', currentUrl, error);
          
          // Essayer une approche alternative avec FileReader
          if (mounted && file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (!mounted || !e.target?.result) return;
              
              const dataUrl = e.target.result as string;
              setImageUrl(dataUrl);
              
              const retryImg = new Image();
              retryImg.onload = () => {
                if (!mounted) return;
                setImageDimensions({ width: retryImg.width, height: retryImg.height });
              };
              retryImg.src = dataUrl;
            };
            reader.readAsDataURL(file);
          }
        };
        
        if (currentUrl && mounted) {
          img.src = currentUrl;
        }
        
      } catch (error) {
        console.error('Erreur lors de la création de l\'URL blob:', error);
        
        // Fallback avec FileReader
        if (mounted && file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!mounted || !e.target?.result) return;
            setImageUrl(e.target.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    };
    
    loadImage();
    
    // Nettoyer
    return () => {
      mounted = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [file]); // Simplifier les dépendances pour éviter les re-créations

  // Séparer l'effet des paramètres de crop
  React.useEffect(() => {
    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      const cropWidth = Math.min(imageDimensions.width, maxWidth);
      const cropHeight = maintainAspectRatio ? cropWidth / aspectRatio : Math.min(imageDimensions.height, maxHeight);
      
      setCropArea({
        x: (imageDimensions.width - cropWidth) / 2,
        y: (imageDimensions.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
      
      setCustomWidth(cropWidth);
      setCustomHeight(cropHeight);
    }
  }, [aspectRatio, maxWidth, maxHeight, maintainAspectRatio, imageDimensions]);

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Vérifier si on est sur une poignée de redimensionnement
    const handles = getResizeHandles();
    for (const handle of handles) {
      if (isPointInHandle(mouseX, mouseY, handle)) {
        setResizeHandle(handle.type);
        setDragStart({ x: mouseX, y: mouseY });
        return;
      }
    }
    
    // Vérifier si on est dans la zone de crop pour déplacer
    if (mouseX >= cropArea.x && mouseX <= cropArea.x + cropArea.width &&
        mouseY >= cropArea.y && mouseY <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({ x: mouseX - cropArea.x, y: mouseY - cropArea.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || (!isDragging && !resizeHandle)) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageDimensions.width / rect.width;
    const scaleY = imageDimensions.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    if (isDragging) {
      // Déplacer la zone de crop
      const newX = Math.max(0, Math.min(mouseX - dragStart.x, imageDimensions.width - cropArea.width));
      const newY = Math.max(0, Math.min(mouseY - dragStart.y, imageDimensions.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (resizeHandle) {
      // Redimensionner la zone de crop
      handleResize(mouseX, mouseY);
    }
  }, [isDragging, resizeHandle, dragStart, cropArea, imageDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizeHandle(null);
  }, []);

  React.useEffect(() => {
    if (isDragging || resizeHandle) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizeHandle, handleMouseMove, handleMouseUp]);

  const getResizeHandles = () => {
    const size = 8;
    return [
      { type: 'nw', x: cropArea.x - size/2, y: cropArea.y - size/2, width: size, height: size },
      { type: 'ne', x: cropArea.x + cropArea.width - size/2, y: cropArea.y - size/2, width: size, height: size },
      { type: 'sw', x: cropArea.x - size/2, y: cropArea.y + cropArea.height - size/2, width: size, height: size },
      { type: 'se', x: cropArea.x + cropArea.width - size/2, y: cropArea.y + cropArea.height - size/2, width: size, height: size },
    ];
  };

  const isPointInHandle = (x: number, y: number, handle: any) => {
    return x >= handle.x && x <= handle.x + handle.width &&
           y >= handle.y && y <= handle.y + handle.height;
  };

  const handleResize = (mouseX: number, mouseY: number) => {
    let newCropArea = { ...cropArea };
    
    switch (resizeHandle) {
      case 'nw':
        newCropArea.width = cropArea.x + cropArea.width - mouseX;
        newCropArea.height = cropArea.y + cropArea.height - mouseY;
        newCropArea.x = mouseX;
        newCropArea.y = mouseY;
        break;
      case 'ne':
        newCropArea.width = mouseX - cropArea.x;
        newCropArea.height = cropArea.y + cropArea.height - mouseY;
        newCropArea.y = mouseY;
        break;
      case 'sw':
        newCropArea.width = cropArea.x + cropArea.width - mouseX;
        newCropArea.height = mouseY - cropArea.y;
        newCropArea.x = mouseX;
        break;
      case 'se':
        newCropArea.width = mouseX - cropArea.x;
        newCropArea.height = mouseY - cropArea.y;
        break;
    }
    
    // Maintenir le ratio si nécessaire
    if (maintainAspectRatio) {
      const currentRatio = newCropArea.width / newCropArea.height;
      if (currentRatio !== aspectRatio) {
        if (resizeHandle?.includes('e')) {
          // Ajuster la hauteur
          newCropArea.height = newCropArea.width / aspectRatio;
        } else {
          // Ajuster la largeur
          newCropArea.width = newCropArea.height * aspectRatio;
        }
      }
    }
    
    // Contraintes
    newCropArea.width = Math.max(50, Math.min(newCropArea.width, imageDimensions.width - newCropArea.x));
    newCropArea.height = Math.max(50, Math.min(newCropArea.height, imageDimensions.height - newCropArea.y));
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, imageDimensions.width - newCropArea.width));
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, imageDimensions.height - newCropArea.height));
    
    setCropArea(newCropArea);
    setCustomWidth(newCropArea.width);
    setCustomHeight(newCropArea.height);
  };

  // Appliquer un preset
  const applyPreset = (preset: typeof presets[0]) => {
    const newWidth = Math.min(preset.width, imageDimensions.width);
    const newHeight = Math.min(preset.height, imageDimensions.height);
    
    setCropArea({
      x: (imageDimensions.width - newWidth) / 2,
      y: (imageDimensions.height - newHeight) / 2,
      width: newWidth,
      height: newHeight
    });
    
    setCustomWidth(newWidth);
    setCustomHeight(newHeight);
  };

  // Modifier les dimensions personnalisées
  const updateCustomDimensions = (width: number, height: number) => {
    const finalWidth = Math.min(width, imageDimensions.width);
    const finalHeight = maintainAspectRatio ? finalWidth / aspectRatio : Math.min(height, imageDimensions.height);
    
    setCropArea({
      x: (imageDimensions.width - finalWidth) / 2,
      y: (imageDimensions.height - finalHeight) / 2,
      width: finalWidth,
      height: finalHeight
    });
    
    setCustomWidth(finalWidth);
    setCustomHeight(finalHeight);
  };

  // Sauvegarder l'image croppée
  const handleSave = () => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          onSave(croppedFile);
        }
      }, file.type, 0.9);
    };
    img.src = imageUrl;
  };

  // Réinitialiser
  const handleReset = () => {
    const cropWidth = Math.min(imageDimensions.width, maxWidth);
    const cropHeight = maintainAspectRatio ? cropWidth / aspectRatio : Math.min(imageDimensions.height, maxHeight);
    
    setCropArea({
      x: (imageDimensions.width - cropWidth) / 2,
      y: (imageDimensions.height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    });
    
    setCustomWidth(cropWidth);
    setCustomHeight(cropHeight);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Crop className="w-5 h-5" />
            Redimensionner l'image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Zone d'édition */}
          <div className="flex-1 p-4">
            <div
              ref={containerRef}
              className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
              style={{ aspectRatio: `${imageDimensions.width}/${imageDimensions.height}`, maxHeight: '500px' }}
              onMouseDown={handleMouseDown}
            >
              {imageUrl && (
                <>
                  <img
                    src={imageUrl}
                    alt="Image à redimensionner"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                  
                  {/* Zone de crop */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20"
                    style={{
                      left: `${(cropArea.x / imageDimensions.width) * 100}%`,
                      top: `${(cropArea.y / imageDimensions.height) * 100}%`,
                      width: `${(cropArea.width / imageDimensions.width) * 100}%`,
                      height: `${(cropArea.height / imageDimensions.height) * 100}%`,
                      cursor: isDragging ? 'moving' : 'move'
                    }}
                  >
                    {/* Poignées de redimensionnement */}
                    {getResizeHandles().map((handle) => (
                      <div
                        key={handle.type}
                        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-pointer"
                        style={{
                          left: `${((handle.x - cropArea.x) / cropArea.width) * 100}%`,
                          top: `${((handle.y - cropArea.y) / cropArea.height) * 100}%`,
                          cursor: handle.type.includes('n') && handle.type.includes('w') ? 'nw-resize' :
                                  handle.type.includes('n') && handle.type.includes('e') ? 'ne-resize' :
                                  handle.type.includes('s') && handle.type.includes('w') ? 'sw-resize' :
                                  'se-resize'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-full lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Dimensions prédéfinies</h4>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-2 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {preset.name}<br />
                      <span className="text-gray-500 dark:text-gray-400">{preset.width}×{preset.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions personnalisées */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Dimensions personnalisées</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Largeur (px)</label>
                    <input
                      type="number"
                      value={Math.round(customWidth)}
                      onChange={(e) => {
                        const width = parseInt(e.target.value) || 0;
                        const height = maintainAspectRatio ? width / aspectRatio : customHeight;
                        updateCustomDimensions(width, height);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      max={imageDimensions.width}
                      min={50}
                    />
                  </div>
                  
                  {!maintainAspectRatio && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hauteur (px)</label>
                      <input
                        type="number"
                        value={Math.round(customHeight)}
                        onChange={(e) => {
                          const height = parseInt(e.target.value) || 0;
                          updateCustomDimensions(customWidth, height);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                        max={imageDimensions.height}
                        min={50}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>Image originale: {imageDimensions.width}×{imageDimensions.height}px</div>
                <div>Zone sélectionnée: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}px</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Appliquer
            </button>
          </div>
        </div>
      </div>

      {/* Canvas caché pour le crop */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
