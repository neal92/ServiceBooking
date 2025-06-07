import React from 'react';
import { 
  Clock, Calendar, User, Mail, Phone, 
  MoreHorizontal, CheckCircle, AlertTriangle, 
  XCircle, Trash
} from 'lucide-react';
import { Appointment } from '../../types';
import AppointmentRecapModal from './AppointmentRecapModal';

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
}

const AppointmentCard = ({ appointment, onDelete, onStatusChange }: AppointmentCardProps) => {
  // Extraire les propriétés en vérifiant qu'elles existent
  const clientName = appointment.clientName || '';
  const clientEmail = appointment.clientEmail || '';
  const clientPhone = appointment.clientPhone || '';
  const serviceName = appointment.serviceName || '';
  const date = appointment.date || '';
  const time = appointment.time || '';
  const duration = appointment.duration || 0;
  const status = appointment.status || 'pending';
  const notes = appointment.notes || '';
  
  const formattedDate = date ? new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }) : '';
  
  const [showMenu, setShowMenu] = React.useState(false);
  const [showRecapModal, setShowRecapModal] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Gestionnaire pour fermer le menu quand on clique en dehors
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && 
          menuRef.current && 
          !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
      case 'confirmed':
        return { 
          bgColor: 'bg-green-100 dark:bg-green-900/30', 
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };      case 'in-progress':
        return { 
          bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: <Clock className="h-5 w-5 text-orange-500" />
        };
      case 'cancelled':
        return { 
          bgColor: 'bg-red-100 dark:bg-red-900/30', 
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <XCircle className="h-5 w-5 text-red-500" />
        };
      case 'completed':
        return { 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />
        };
      default:
        return { 
          bgColor: 'bg-gray-100 dark:bg-gray-800', 
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />
        };
    }
  };
  // Récupérer les couleurs et icône en fonction du statut
  const { bgColor, textColor, icon } = getStatusDetails(status);

  // Fonction pour formater la durée
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h${remainingMinutes}`;
  };
  
  // Stopper la propagation du clic sur le menu pour éviter d'ouvrir le modal de récap
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div 
        className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
        onClick={() => setShowRecapModal(true)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
              {serviceName}
            </p>
            <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <span className="truncate">{clientName}</span>
            </p>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
              {icon && <span className="mr-1">{icon}</span>}
              {status === 'pending' && 'En attente'}
              {status === 'confirmed' && 'Confirmé'}
              {status === 'in-progress' && 'En cours'}
              {status === 'cancelled' && 'Annulé'}
              {status === 'completed' && 'Terminé'}
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between">
          <div className="sm:flex sm:justify-start">
            <div className="mr-6 pl-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-white">
                <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <p>{time ? time.substring(0, 5) : ''} ({formatDuration(duration)})</p>
              </div>
            </div>
            
            <div>
              {clientEmail && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  <p>{clientEmail}</p>
                </div>
              )}
              {clientPhone && (
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  <p>{clientPhone}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative" onClick={handleMenuClick}>
            {onDelete && onStatusChange && (
              <>
                <button
                  ref={buttonRef}
                  type="button"
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                
                {showMenu && (
                  <div ref={menuRef} className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {status !== 'confirmed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange('confirmed');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <CheckCircle className="inline mr-2 h-4 w-4 text-green-500" />
                          Confirmer
                        </button>
                      )}
                        {status !== 'in-progress' && status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange('in-progress');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <Clock className="inline mr-2 h-4 w-4 text-orange-500" />
                          En cours
                        </button>
                      )}
                      
                      {status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange('completed');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <CheckCircle className="inline mr-2 h-4 w-4 text-blue-500" />
                          Terminé
                        </button>
                      )}
                      
                      {status !== 'cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange('cancelled');
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          <XCircle className="inline mr-2 h-4 w-4 text-red-500" />
                          Annuler
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        role="menuitem"
                      >
                        <Trash className="inline mr-2 h-4 w-4 text-red-500" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {notes && (
          <div className="mt-2 sm:flex sm:justify-start">
            <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2 w-full">
              <p className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
              <p className="whitespace-pre-wrap">{notes}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de récapitulatif */}
      {showRecapModal && (
        <AppointmentRecapModal 
          isOpen={showRecapModal}
          onClose={() => setShowRecapModal(false)}
          appointment={appointment}
        />
      )}
    </>
  );
};

export default AppointmentCard;
