import * as React from 'react';
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import { Link } from 'react-router-dom';

/**
 * Page placeholder pour le calendrier en cours de développement
 */
const Calendar: React.FC = () => {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendrier</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <CalendarIcon className="h-20 w-20 text-blue-500/50 dark:text-blue-400/50" />
          </div>
          
          <div className="text-gray-500 dark:text-gray-300 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Page en cours de développement
            </h2>
            <p className="text-lg mb-4">
              Cette fonctionnalité sera bientôt disponible avec une interface intuitive pour gérer votre planning.
            </p>
            <p>
              Nous travaillons à vous offrir une expérience optimale pour la gestion de votre calendrier.
            </p>
          </div>
          
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">En attendant...</h3>
            </div>
            <p className="text-blue-600 dark:text-blue-400 mb-6">
              Veuillez utiliser la page "Mes Rendez-vous" pour gérer vos réservations.
            </p>
            <Link 
              to="/appointments" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Aller à Mes Rendez-vous
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Calendar;
