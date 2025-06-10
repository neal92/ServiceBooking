import { useState, useEffect } from 'react';

/**
 * Composant exemple montrant les correctifs pour Calendar.tsx
 * Ce composant peut être utilisé comme référence ou importé directement
 */
const CalendarFix = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 1. Délai maximum pour le loader (réduit à 2 secondes)
    const timeoutId = setTimeout(() => {
      // Code qui serait normalement exécuté ici
    }, 200);
    
    const maxLoadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(maxLoadingTimeout);
    };
  }, []);
  
  return (
    // 2. Loader amélioré sans la deuxième ligne de texte
    <div className="relative flex-1 flex min-h-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-8 py-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 animate-zoomIn">
            <div className="relative">
              {/* Spinner principal */}
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              {/* Spinner secondaire */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-300 dark:border-blue-600 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>
            <p className="mt-5 text-blue-600 dark:text-blue-400 font-medium animate-pulse">Chargement du calendrier...</p>
            {/* Ligne "Préparation de votre agenda" supprimée */}
            <div className="flex gap-1.5 mt-3">
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ici, vous pouvez ajouter le contenu du calendrier */}
      <div className="flex-1">
        {!isLoading && <div>Contenu du calendrier ici</div>}
      </div>
    </div>
  );
};

export default CalendarFix;
