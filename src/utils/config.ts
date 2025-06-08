// Configuration centrale de l'application

// URL de base du serveur
export const API_BASE_URL = 'http://localhost:5000';
export const MEDIA_URL = API_BASE_URL;

// Helper pour obtenir l'URL absolue des médias
export const getFullMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('/')) {
    return `${MEDIA_URL}${path}`;
  }
  return path;
};
