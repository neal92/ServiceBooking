import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import PageTransition from '../components/layout/PageTransition';
import CalendarBackground from '../components/calendar/CalendarBackground';
import { Info, Calendar as CalendarIcon } from 'lucide-react';
import { enhanceCalendar } from '../utils/calendarEnhancer';
import '../calendar-styles.css'; // Import des styles supplémentaires pour le calendrier

const LOADING_TIMEOUT = 300; // Délai avant de charger les améliorations
const MAX_LOADING_TIMEOUT = 1000; // Délai maximum d'affichage du loader

/**
 * Composant de page Calendrier - Affiche le calendrier des rendez-vous
 */
const Calendar = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  
  // Fonction mémorisée pour forcer le rechargement du calendrier
  const handleAppointmentUpdated = useCallback(() => {
    console.log("Mise à jour du calendrier depuis la page parente");
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  
  // Appliquer les améliorations UX après le rendu
  useEffect(() => {
    setIsLoading(true);
    
    // Ne pas appliquer d'optimisations immédiatement pour éviter un blocage au chargement
    const mainTimeoutId = setTimeout(() => {
      try {
        // Utiliser requestAnimationFrame pour éviter de bloquer le thread principal
        requestAnimationFrame(() => {
          // Charger les améliorations basiques et marquer comme chargé
          setIsLoading(false);
          
          // Différer les améliorations visuelles
          requestAnimationFrame(() => {
            enhanceCalendar();
          });
        });
      } catch (err) {
        console.error('Erreur lors de l\'amélioration du calendrier:', err);
        setIsLoading(false);
      }
    }, LOADING_TIMEOUT);
    
    // Garantir que le loader disparaît après le délai maximum, même en cas de problème
    const maxLoadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, MAX_LOADING_TIMEOUT);
    
    return () => {
      clearTimeout(mainTimeoutId);
      clearTimeout(maxLoadingTimeout);
    };
  }, [refreshKey]);
    // Optimiser le calendrier lors des changements de taille d'écran
  useEffect(() => {
    // Référence pour le timer de debounce
    let resizeTimer: number;
    
    // Gestionnaire de redimensionnement optimisé avec debounce
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        try {
          // Utiliser requestAnimationFrame pour synchroniser avec le cycle de rendu
          requestAnimationFrame(() => {
            // Sélecteur de performance amélioré - utilisation d'un seul appel DOM
            const fcElement = document.querySelector('.fc') as HTMLElement;
            if (fcElement) {
              // Appliquer les deux styles en une seule opération
              Object.assign(fcElement.style, {
                height: '100%',
                width: '100%'
              });
              
              // Déclencher un événement resize pour les composants qui en dépendent
              window.dispatchEvent(new Event('resize'));
            }
          });
        } catch (err) {
          console.error('Erreur lors du redimensionnement du calendrier:', err);
        }
      }, 100);
    };
    
    // Ajouter l'écouteur d'événements
    window.addEventListener('resize', handleResize);
    
    // Nettoyage lors du démontage
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
    // Effet de fondu pour le chargement du calendrier
  useEffect(() => {
    const container = calendarContainerRef.current;
    if (!container) return;
    
    // Appliquer les transitions avec requestAnimationFrame pour de meilleures performances
    if (isLoading) {
      requestAnimationFrame(() => {
        container.style.opacity = '0.6';
        container.style.transition = 'opacity 200ms ease-in-out';
      });
    } else {
      // Utiliser une seule transition fluide pour restaurer l'opacité
      requestAnimationFrame(() => {
        container.style.transition = 'opacity 300ms ease-in-out';
        container.style.opacity = '1';
      });
    }
  }, [isLoading]);
  
  return (
    <PageTransition type="slide">
      <div className="h-screen flex flex-col max-w-full px-0 gap-y-0.5">        <div className="mb-1">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-xl py-3 px-5 border border-blue-100 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Calendrier des rendez-vous</h1>
                <p className="hidden md:block text-sm text-gray-600 dark:text-gray-300 md:ml-4">
                  Consultez, ajoutez ou modifiez vos rendez-vous
                </p>
              </div>
            </div>
          </div>
        </div>
          <div className="relative flex-1 flex flex-col md:flex-row gap-4 min-h-0 calendar-container-wrapper">
          {/* Calendrier principal */}
          <div className="flex-1 relative min-h-0 order-2 md:order-1">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
                <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-8 py-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 animate-zoomIn">
                  <div className="relative">
                    {/* Spinner principal plus grand et plus visible */}
                    <div className="w-20 h-20 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    {/* Spinner secondaire */}
                    <div className="absolute inset-0 w-20 h-20 border-4 border-blue-300 dark:border-blue-600 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>                  </div>
                  <p className="mt-5 text-blue-600 dark:text-blue-400 font-medium text-lg animate-pulse">Chargement du calendrier...</p>
                  <div className="flex gap-2 mt-3">
                    <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div 
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-lg relative flex-1 flex flex-col w-full h-full"
              style={{ 
                opacity: isLoading ? 0.6 : 1,
                background: "linear-gradient(to bottom, rgba(239, 246, 255, 0.4), rgba(255, 255, 255, 1))",
              }}
              ref={calendarContainerRef}>
              <CalendarBackground />              <div className="flex-1 min-h-0 flex flex-col relative z-1 w-full h-full calendar-container">
                {/* Utilisation du memo avec une key pour le rechargement contrôlé */}
                <AppointmentCalendar
                  key={refreshKey}
                  className="appointment-calendar-main"
                  onAppointmentUpdated={handleAppointmentUpdated}
                />
              </div>
            </div>
          </div>
          
          {/* Panneau de filtres à droite */}
          <div className="md:w-64 w-full order-1 md:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 sticky top-0">
              <div className="flex flex-col gap-y-3">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <Info size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">Légende des statuts</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-y-2">
                  <div className="flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border border-green-200 dark:border-green-800/50 text-sm text-green-800 dark:text-green-300">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                    Confirmé
                  </div>
                  <div className="flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-300">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></div>
                    En attente
                  </div>
                  <div className="flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 border border-red-200 dark:border-red-800/50 text-sm text-red-800 dark:text-red-300">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></div>
                    Annulé
                  </div>
                  <div className="flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800/50 text-sm text-blue-800 dark:text-blue-300">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>
                    Terminé
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Calendar;
