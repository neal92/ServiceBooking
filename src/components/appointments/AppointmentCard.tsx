import React from 'react';
import { 
  Clock, Calendar, User, Mail, Phone, 
  MoreHorizontal, CheckCircle, AlertTriangle, 
  XCircle
} from 'lucide-react';
import { Appointment } from '../../types';

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

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          bgColor: 'bg-yellow-100', 
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: <Clock className="h-5 w-5 mr-2" />,
          label: 'En attente'
        };
      case 'confirmed':
        return { 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="h-5 w-5 mr-2" />,
          label: 'Confirmé'
        };
      case 'cancelled':
        return { 
          bgColor: 'bg-red-100', 
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: <XCircle className="h-5 w-5 mr-2" />,
          label: 'Annulé'
        };
      case 'completed':
        return { 
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: <CheckCircle className="h-5 w-5 mr-2" />,
          label: 'Terminé'
        };
      default:
        return { 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: <AlertTriangle className="h-5 w-5 mr-2" />,
          label: 'Inconnu'
        };
    }
  };

  const statusDetails = getStatusDetails(status);
  
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowMenu(false);
  };

  // Calculer l'heure de fin en fonction de la durée
  const calculateEndTime = () => {
    if (!time || !duration) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + duration;
    
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    
    // Format avec leading zeros
    const formattedEndHours = endHours.toString().padStart(2, '0');
    const formattedEndMinutes = endMinutes.toString().padStart(2, '0');
    
    return `${formattedEndHours}:${formattedEndMinutes}`;
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-150 relative overflow-hidden rounded-lg border border-gray-100 shadow-sm">
      {/* Status indicator strip */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${status === 'pending' ? 'bg-yellow-400' : status === 'confirmed' ? 'bg-green-500' : status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      
      <div className="flex items-start justify-between pl-2">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`h-14 w-14 rounded-lg flex items-center justify-center text-white ${status === 'cancelled' ? 'bg-gray-400' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} shadow-md`}>
              <span className="text-xl font-semibold">{serviceName ? serviceName.charAt(0).toUpperCase() : 'A'}</span>
            </div>
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <h3 className="text-base font-medium text-indigo-700">{serviceName}</h3>              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-opacity-90 border ${statusDetails.bgColor} ${statusDetails.textColor} ${statusDetails.borderColor}`}>
                {statusDetails.label}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">{clientName}</p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg z-10 border border-gray-100">
              <div className="py-1 divide-y divide-gray-100">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changer le statut
                  </div>
                  <button 
                    onClick={() => handleStatusChange('pending')}
                    className="flex w-full items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                  >
                    <Clock className="mr-3 h-4 w-4 text-yellow-500" />
                    En attente
                  </button>
                  <button 
                    onClick={() => handleStatusChange('confirmed')}
                    className="flex w-full items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="mr-3 h-4 w-4 text-green-500" />
                    Confirmé
                  </button>
                  <button 
                    onClick={() => handleStatusChange('completed')}
                    className="flex w-full items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <CheckCircle className="mr-3 h-4 w-4 text-blue-500" />
                    Terminé
                  </button>
                  <button 
                    onClick={() => handleStatusChange('cancelled')}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="mr-3 h-4 w-4 text-red-500" />
                    Annulé
                  </button>
                </div>
                <button 
                  onClick={() => onDelete && onDelete()}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <XCircle className="mr-3 h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pl-2">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-indigo-100 mr-3 flex-shrink-0">
                <Calendar className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Date</div>
                <div className="text-sm text-gray-700">{formattedDate}</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-indigo-100 mr-3 flex-shrink-0">
                <Clock className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Heure</div>
                <div className="text-sm text-gray-700">
                  {time} {duration ? `- ${calculateEndTime()}` : ''}
                  {duration ? <span className="text-xs text-gray-500 ml-1">({duration} min)</span> : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pl-2 divide-y divide-gray-100">
        <div className="py-3">
          <div className="flex items-center">
            <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
            <a href={`mailto:${clientEmail}`} className="text-sm text-blue-600 hover:underline">{clientEmail}</a>
          </div>
          
          {clientPhone && (
            <div className="mt-1 flex items-center">
              <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
              <a href={`tel:${clientPhone}`} className="text-sm text-blue-600 hover:underline">{clientPhone}</a>
            </div>
          )}
        </div>

        {notes && (
          <div className="py-3">
            <div className="text-xs text-gray-500 font-medium mb-1">Notes</div>
            <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-md border border-gray-100">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;