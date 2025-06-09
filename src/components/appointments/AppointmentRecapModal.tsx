import React, { useState } from 'react';
import { X, Calendar, Clock, User, Mail, Phone, CheckCircle, AlertTriangle, XCircle, Pencil, Trash } from 'lucide-react';
import { Appointment } from '../../types';
import ModalPortal from '../layout/ModalPortal';
import NewAppointmentModal from './NewAppointmentModal';
import SuccessToast from '../layout/SuccessToast';
import ErrorToast from '../layout/ErrorToast';

interface AppointmentRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onDelete?: (id: number) => Promise<void>;
  onStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
}

const AppointmentRecapModal: React.FC<AppointmentRecapModalProps> = ({ isOpen, onClose, appointment, onDelete, onStatusChange }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  if (!isOpen || !appointment) return null;

  const formattedDate = appointment.date 
    ? new Date(appointment.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }) : '';

  // Fonction pour formater la durée
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h${remainingMinutes}`;
  };
  const getStatusDetails = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return { 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          label: 'En attente'
        };
      case 'confirmed':
        return { 
          bgColor: 'bg-green-100 dark:bg-green-900/30', 
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: 'Confirmé'
        };      case 'in-progress':
        return { 
          bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: <Clock className="h-5 w-5 text-orange-500" />,
          label: 'En cours'
        };
      case 'cancelled':
        return { 
          bgColor: 'bg-red-100 dark:bg-red-900/30', 
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: 'Annulé'
        };
      case 'completed':
        return { 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
          label: 'Terminé'
        };
      default:
        return { 
          bgColor: 'bg-gray-100 dark:bg-gray-800', 
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
          label: 'Statut inconnu'
        };
    }
  };

  const statusDetails = getStatusDetails(appointment.status);

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  // Status update handler
  const handleStatusChange = async (newStatus: Appointment['status']) => {
    try {
      await onStatusChange(appointment.id.toString(), newStatus);
      setSuccessMessage('Statut du rendez-vous modifié');
      setShowSuccessToast(true);
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setErrorMessage('Une erreur est survenue lors de la mise à jour du statut');
      setShowErrorToast(true);
    }
  };

  return (
    <>
      <ModalPortal isOpen={isOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto modal-backdrop animate-fadeIn">
          {/* Overlay semi-transparent */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
          
          {/* Success Toast */}
          <SuccessToast 
            message={successMessage}
            show={showSuccessToast}
            onClose={() => setShowSuccessToast(false)}
            duration={2000}
          />
          
          {/* Error Toast */}
          <ErrorToast 
            message={errorMessage}
            show={showErrorToast}
            onClose={() => setShowErrorToast(false)}
            duration={2000}
          />
          
          {/* Modal content */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl animate-fadeIn mx-4" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600">
              <h3 className="text-xl font-semibold text-white animate-fadeIn">
                Récapitulatif du rendez-vous
              </h3>
              <button
                type="button"
                className="text-white hover:text-gray-100 transition-colors duration-200"
                onClick={onClose}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              {/* Service info */}
              <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {appointment.serviceName}
                </h4>
                <div className="flex items-center mt-2">
                  <div className={`px-3 py-1 inline-flex items-center rounded-full ${statusDetails.bgColor} ${statusDetails.textColor}`}>
                    {statusDetails.icon && <span className="mr-1">{statusDetails.icon}</span>}
                    {statusDetails.label}
                  </div>
                  {appointment.price && (
                    <div className="ml-4 text-gray-700 dark:text-gray-300 font-medium">
                      {appointment.price} €
                    </div>
                  )}
                </div>
              </div>
              
              {/* Date and time info */}
              <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Date et heure</h4>
                <div className="flex items-start mb-2">
                  <Calendar className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {appointment.time ? appointment.time.substring(0, 5) : ''} 
                      {appointment.duration ? ` (${formatDuration(appointment.duration)})` : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Client info */}
              <div className="mb-5">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Informations client</h4>
                <div className="flex items-start mb-2">
                  <User className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">{appointment.clientName}</p>
                  </div>
                </div>
                {appointment.clientEmail && (
                  <div className="flex items-start mb-2">
                    <Mail className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-gray-800 dark:text-white">{appointment.clientEmail}</p>
                    </div>
                  </div>
                )}
                {appointment.clientPhone && (
                  <div className="flex items-start">
                    <Phone className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-gray-800 dark:text-white">{appointment.clientPhone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes */}
              {appointment.notes && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div>
                <button
                  type="button"
                  className="px-4 py-2 border border-blue-500 dark:border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowEditModal(true)}
                >
                  <Pencil className="inline-block mr-1 h-4 w-4" />
                  Modifier
                </button>
              </div>              {appointment.status === 'completed' && onDelete && (
                <button
                  type="button"
                  className="px-4 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm font-medium rounded-md text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    onDelete(appointment.id);
                    onClose();
                  }}
                >
                  <Trash className="inline-block mr-1 h-4 w-4" />
                  Supprimer
                </button>
              )}
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={onClose}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
      
      {/* Modal d'édition */}
      {showEditModal && (
        <NewAppointmentModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          appointment={appointment}
          onDelete={onDelete}
        />
      )}
      
      {/* Success Toast */}
      <SuccessToast 
        show={showSuccessToast}
        message={successMessage}
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

export default AppointmentRecapModal;
