// filepath: c:\Users\adrie\OneDrive\Documents\Perso\ServiceBooking\src\pages\Calendar.tsx
import * as React from 'react';
import PageTransition from '../components/layout/PageTransition';
import { Calendar as CalendarIcon } from 'lucide-react';

/**
 * Composant de page Calendrier - Version simplifi�e sans la logique complexe
 */
const Calendar = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendrier</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 dark:text-gray-300 mb-6">
            <p className="text-lg mb-4">
              Le calendrier est temporairement désactivé pour maintenance.
            </p>
            <p>
              Nous travaillons actuellement à l'amélioration de cette fonctionnalité pour 
              vous offrir une meilleure expérience. Veuillez utiliser l'onglet "Rendez-vous" 
              pour gérer vos rendez-vous en attendant.
            </p>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Fonctionnalité disponible prochainement
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Calendar;
