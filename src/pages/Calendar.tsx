import { useState, useEffect, useRef } from 'react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import PageTransition from '../components/layout/PageTransition';
import { Info } from 'lucide-react';
import { enhanceCalendar } from '../utils/calendarEnhancer';

const Calendar = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Fonction pour forcer le rechargement du calendrier
  const handleAppointmentUpdated = () => {
    console.log("Mise à jour du calendrier depuis la page parente");
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Appliquer les améliorations UX après le rendu
  useEffect(() => {
    // Laisser le temps au calendrier de se charger
    const timeoutId = setTimeout(() => {
      enhanceCalendar();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [refreshKey]);
    return (
    <PageTransition type="slide">
      <div className="h-screen flex flex-col">
        <div className="mb-4">          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier des rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez, ajoutez ou modifiez vos rendez-vous dans le calendrier.
          </p>
        </div>
          {/* Légende des statuts */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Info size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Légende des statuts</h3>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              Confirmé            </div>
            <div className="flex items-center px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200">
              <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
              En attente
            </div>
            <div className="flex items-center px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
              Annulé
            </div>
            <div className="flex items-center px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
              Terminé            </div>
          </div>
        </div>            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 flex flex-col" style={{ height: 'calc(100vh - 300px)' }} ref={calendarContainerRef}>
              <AppointmentCalendar
                key={refreshKey}
                onAppointmentUpdated={handleAppointmentUpdated}
              />
            </div>
          </div>
      </div>
    </PageTransition>
  );
};

export default Calendar;
