import React from 'react';
import { Clock, Calendar, User, Mail, Phone, MoreHorizontal } from 'lucide-react';
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
  // Duration is declared but not currently used in this component
  const duration = appointment.duration || 0; 
  const status = appointment.status || 'pending';
  const notes = appointment.notes || '';
  
  const formattedDate = date ? new Date(date).toLocaleDateString() : '';
  const [showMenu, setShowMenu] = React.useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case 'confirmed':
        return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'cancelled':
        return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
      case 'completed':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const statusColor = getStatusColor(status);
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowMenu(false);
  };

  return (
    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${statusColor.bgColor}`}>
              {serviceName ? serviceName.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-blue-600">{serviceName}</h3>
            <div className="mt-1 flex items-center">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">{clientName}</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button 
                  onClick={() => handleStatusChange('pending')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Marquer comme en attente
                </button>
                <button 
                  onClick={() => handleStatusChange('confirmed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Marquer comme confirmé
                </button>
                <button 
                  onClick={() => handleStatusChange('cancelled')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Marquer comme annulé
                </button>
                <button 
                  onClick={() => handleStatusChange('completed')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Marquer comme terminé
                </button>
                <div className="border-t border-gray-100"></div>                <button 
                  onClick={() => onDelete && onDelete()}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:flex sm:justify-between">
        <div className="sm:flex">
          <div className="flex items-center mr-6">
            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="mt-2 flex items-center sm:mt-0">
            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center sm:mt-0">
          <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.bgColor} ${statusColor.textColor}`}>
            {status}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center">
          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-500">{clientEmail}</p>
        </div>
        {clientPhone && (
          <div className="mt-1 flex items-center">
            <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500">{clientPhone}</p>
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="italic">{notes}</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;