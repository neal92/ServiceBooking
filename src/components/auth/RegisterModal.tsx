import React from 'react';
import { Calendar, Briefcase, X } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfessional: () => void;
  onClient: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onProfessional, onClient }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-fadeIn">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choisissez votre profil
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sélectionnez le type de compte qui vous correspond
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Option Client */}
          <button 
            onClick={onClient}
            className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
          >
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Je suis client</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Je souhaite réserver des services
            </p>
          </button>
          
          {/* Option Professionnel */}
          <button 
            onClick={onProfessional}
            className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
          >
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Je suis professionnel</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Je propose des services
            </p>
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Déjà inscrit ?{' '}
            <a 
              href="/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
