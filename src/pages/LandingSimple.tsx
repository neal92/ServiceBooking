import * as React from 'react';
import { Link } from 'react-router-dom';

const LandingSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ServiceBooking
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Système de réservation de services
          </p>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              to="/register" 
              className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              S'enregistrer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSimple;
