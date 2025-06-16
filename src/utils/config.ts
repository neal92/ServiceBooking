/**
 * Configuration centralisée pour l'application
 * Utilise les variables d'environnement du fichier .env
 */

// URL de base de l'API (depuis .env)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// URL de base pour les fichiers médias (depuis .env)
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:5000';

/**
 * Obtient l'URL complète pour un fichier média
 * @param path - Chemin relatif du fichier média
 * @returns URL complète du fichier média
 */
export function getFullMediaUrl(path: string | null | undefined): string {
  if (!path) {
    return `${MEDIA_BASE_URL}/avatars/avatar1.svg`; // Image par défaut
  }
  
  // Si le chemin commence déjà par http, c'est déjà une URL complète
  if (path.startsWith('http')) {
    return path;
  }
  
  // Sinon, ajouter l'URL de base
  return `${MEDIA_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
