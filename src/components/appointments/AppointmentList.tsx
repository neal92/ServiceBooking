import { CalendarX } from 'lucide-react';
import AppointmentCard from './AppointmentCard';
import { Appointment } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
  onDelete: (id: number) => Promise<void>;
  onStatusChange: (id: string, status: Appointment['status']) => Promise<void>;
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

  if (appointments.length === 0) {
    return (
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
  }

  const groupedAppointments = groupAppointmentsByDate();
  const sortedDates = sortDates(Object.keys(groupedAppointments));

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="sticky top-0 z-10">
            <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/95 dark:to-gray-800 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(date)}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {groupedAppointments[date].length} rendez-vous
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {groupedAppointments[date].map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all hover:shadow-md"
              >                <AppointmentCard 
                  appointment={appointment} 
                  onDelete={() => onDelete(appointment.id)} 
                  onStatusChange={(id, status) => onStatusChange(id.toString(), status)} 
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