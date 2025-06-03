import React from 'react';
import { Clock, Calendar, User, MapPin } from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime, getStatusColor } from '../../utils/formatters';
import { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const { service, client, date, duration, location, status } = appointment;
  const formattedDate = formatAppointmentDate(date);
  const formattedTime = formatAppointmentTime(date, duration);
  const statusColor = getStatusColor(status);

  return (
    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${statusColor.bgColor}`}>
              {service.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-blue-600">{service}</h3>
            <div className="mt-1 flex items-center">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">{client}</p>
            </div>
          </div>
        </div>
        <div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.textColor} ${statusColor.lightBgColor}`}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="mt-4 sm:flex sm:justify-between">
        <div className="sm:flex">
          <div className="flex items-center mr-6">
            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="mt-2 flex items-center sm:mt-0">
            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-500">{formattedTime}</p>
          </div>
        </div>
        {location && (
          <div className="mt-2 flex items-center sm:mt-0">
            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;