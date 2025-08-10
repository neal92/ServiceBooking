import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
  serviceId: number;
  imageName?: string;
  useThumbnail?: boolean;
  forceRefresh?: boolean;
  alt: string;
  className?: string;
  onError?: () => void;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  serviceId,
  imageName,
  useThumbnail = false,
  forceRefresh = false,
  alt,
  className,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!imageName) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    // Si imageName est une URL absolue ou commence par /images/, utiliser directement
    if (
      imageName.startsWith('http') ||
      imageName.startsWith('/images/')
    ) {
      setImageUrl(imageName);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Ne pas utiliser d'URLs blob
    if (imageName.startsWith('blob:')) {
      buildApiUrl();
      return;
    }

    buildApiUrl();
  }, [serviceId, imageName, useThumbnail, forceRefresh]);

  const buildApiUrl = () => {
    const baseUrl = useThumbnail 
      ? `/api/services/${serviceId}/thumbnail`
      : `/api/services/${serviceId}/image`;
    
    const cacheBuster = forceRefresh || retryCount > 0 ? `?t=${Date.now()}` : '';
    setImageUrl(`${baseUrl}${cacheBuster}`);
    setIsLoading(true);
    setHasError(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    
    // Essayer de recharger une fois sans cache buster
    if (retryCount === 0 && imageUrl?.includes('?t=')) {
      setRetryCount(1);
      const urlWithoutCache = imageUrl.split('?')[0];
      setImageUrl(urlWithoutCache);
      return;
    }
    
    // Essayer avec cache buster si on n'en avait pas
    if (retryCount === 0 && !imageUrl?.includes('?t=')) {
      setRetryCount(1);
      setImageUrl(`${imageUrl}?t=${Date.now()}`);
      return;
    }
    
    // Après 2 tentatives, considérer comme erreur
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  // Afficher le placeholder si pas d'image, en cours de chargement, ou erreur
  if (!imageName || hasError) {
    return null; // Laisser le composant parent gérer le placeholder
  }

  return (
    <img
      src={imageUrl || ''}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{ display: isLoading ? 'none' : 'block' }}
    />
  );
};

export default ImageLoader;
