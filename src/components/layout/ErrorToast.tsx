import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  show: boolean;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ 
  message, 
  duration = 3000, 
  onClose,
  show 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center p-4 mb-4 w-full max-w-xs text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 animate-slideInRight">
      <div className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Close"
      >
        <span className="sr-only">Fermer</span>
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ErrorToast;
