import React from 'react';
import { CalendarX } from 'lucide-react';
import AppointmentCard from './AppointmentCard';
import { Appointment } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const AppointmentList = ({ appointments, onDelete, onStatusChange }: AppointmentListProps) => {
  // Grouper les rendez-vous par date
  const groupAppointmentsByDate = () => {
    const groups: { [key: string]: Appointment[] } = {};
    
    appointments.forEach((appointment) => {
      const date = appointment.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });
    
    return groups;
  };

  // Formater les dates pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Vérifier si c'est aujourd'hui, demain ou un autre jour
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  // Trier les dates
  const sortDates = (dates: string[]) => {
    return dates.sort((a, b) => {
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      return dateA - dateB;
    });
  };
  if (appointments.length === 0) {    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
          <CalendarX className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Aucun rendez-vous trouvé</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md text-center">
          Aucun rendez-vous ne correspond aux critères sélectionnés. Vous pouvez créer un nouveau rendez-vous ou modifier vos filtres.
        </p>
      </div>
    );
  }  const groupedAppointments = groupAppointmentsByDate();
  const sortedDates = sortDates(Object.keys(groupedAppointments));  return (
    <div className="space-y-0">
      {sortedDates.map((date) => (
        <div 
          key={date} 
          className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0`}
        >          
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white uppercase tracking-wider sticky top-0 bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 z-10 shadow-sm">
            {formatDate(date)}
          </h3>
          <div className="px-4 py-5 sm:px-6 grid grid-cols-1 gap-5">
            {groupedAppointments[date].map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white dark:bg-gray-800 shadow-sm rounded-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md"
              >
                <AppointmentCard 
                  appointment={appointment} 
                  onDelete={() => onDelete(appointment.id)} 
                  onStatusChange={(status) => onStatusChange(appointment.id, status)} 
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;