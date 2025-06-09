import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Calendar, User, Mail, Phone, 
  MoreHorizontal, CheckCircle, AlertTriangle, 
  XCircle, Trash
} from 'lucide-react';
import { Appointment } from '../../types';
import AppointmentRecapModal from './AppointmentRecapModal';
import { ModalPortal, SuccessToast, ErrorToast } from '../layout';

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete?: (id: number) => Promise<void>;
  onStatusChange?: (id: string, status: Appointment['status']) => Promise<void>;
}

const AppointmentCard = ({ appointment, onDelete, onStatusChange }: AppointmentCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<Appointment['status'] | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
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

  // Extract properties and check for existence
  const clientName = appointment.clientName || '';
  const clientEmail = appointment.clientEmail || '';
  const clientPhone = appointment.clientPhone || '';
  const serviceName = appointment.serviceName || '';
  const date = appointment.date || '';
  const time = appointment.time || '';
  const duration = appointment.duration || 0;
  const status = appointment.status;
  const notes = appointment.notes || '';
  
  const formattedDate = date ? new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }) : '';
  
  // Get colors and icon based on status
  const getStatusDetails = (status: Appointment['status']) => {
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
        };      
      case 'in-progress':
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

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h${remainingMinutes}`;
  };
  
  // Stop click propagation for menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle status change with confirmation
  const handleStatusChange = (newStatus: Appointment['status']) => {
    setStatusToConfirm(newStatus);
    setShowConfirmDialog(true);
    setShowMenu(false);
  };

  // Delete handler
  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(appointment.id);
        setShowMenu(false);
      } catch (err) {
        console.error('Error deleting appointment:', err);
      }
    }
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (statusToConfirm && onStatusChange) {
      try {
        await onStatusChange(appointment.id.toString(), statusToConfirm);
        setShowConfirmDialog(false);
        setShowSuccessToast(true);
      } catch (err) {
        console.error('Error updating status:', err);
        setShowConfirmDialog(false);
        setErrorMessage('Une erreur est survenue lors de la mise à jour du statut');
        setShowErrorToast(true);
      }
    }
  };

  // Menu options based on status
  const getMenuOptions = () => {
    // Options for in-progress appointments
    if (status === 'in-progress') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('completed');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <CheckCircle className="inline mr-2 h-4 w-4 text-blue-500" />
            Terminer
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('cancelled');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <XCircle className="inline mr-2 h-4 w-4 text-red-500" />
            Annuler
          </button>
        </>
      );
    }

    // Options for pending or confirmed appointments
    if (status === 'pending' || status === 'confirmed') {
      return (
        <>
          {status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('confirmed');
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <CheckCircle className="inline mr-2 h-4 w-4 text-green-500" />
              Confirmer
            </button>
          )}

          {status === 'confirmed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('in-progress');
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Clock className="inline mr-2 h-4 w-4 text-orange-500" />
              En cours
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange('cancelled');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            <XCircle className="inline mr-2 h-4 w-4 text-red-500" />
            Annuler
          </button>
        </>
      );
    }

    // Delete option for completed or cancelled appointments
    if ((status === 'completed' || status === 'cancelled') && onDelete) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          role="menuitem"
        >
          <Trash className="inline mr-2 h-4 w-4 text-red-500" />
          Supprimer
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <div 
        className="px-6 py-5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
        onClick={() => setShowRecapModal(true)}
      >
        <div className="flex items-center justify-between">          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
              {serviceName}
            </p>
            <p className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <span className="truncate">{clientName}</span>
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {(() => {
              const { bgColor, textColor, icon } = getStatusDetails(status);
              return (
                <p className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                  {icon && <span className="mr-1.5">{icon}</span>}
                  {status === 'pending' && 'En attente'}
                  {status === 'confirmed' && 'Confirmé'}
                  {status === 'in-progress' && 'En cours'}
                  {status === 'cancelled' && 'Annulé'}
                  {status === 'completed' && 'Terminé'}
                </p>
              );
            })()}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div className="sm:flex sm:justify-start space-y-2 sm:space-y-0 sm:space-x-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
              </div>
              <div className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                <div className="mt-1.5 flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                      {getMenuOptions()}
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
      
      {/* Récapitulatif modal */}
      {showRecapModal && (
        <AppointmentRecapModal 
          isOpen={showRecapModal}
          onClose={() => setShowRecapModal(false)}
          appointment={appointment}
          onDelete={onDelete}
          onStatusChange={async (id, newStatus) => {
            if (onStatusChange) {
              return onStatusChange(id, newStatus);
            }
            return Promise.resolve();
          }}
        />
      )}

      {/* Confirmation dialog */}
      {showConfirmDialog && statusToConfirm && (
        <ModalPortal isOpen={showConfirmDialog}>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowConfirmDialog(false)}></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
              <div className="p-6 text-center">
                <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">
                  Êtes-vous sûr de votre choix, celui-ci est irréversible
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDialog(false)}
                    className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmStatusChange}
                    className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Success Toast */}
      <SuccessToast 
        show={showSuccessToast}
        message="Statut modifié"
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Error Toast */}
      <ErrorToast
        show={showErrorToast} 
        message={errorMessage}
        onClose={() => setShowErrorToast(false)}
      />
    </>
  );
};

export default AppointmentCard;
