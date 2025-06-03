import React from 'react';
import AppointmentCard from './AppointmentCard';
import { Appointment } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
}

const AppointmentList = ({ appointments }: AppointmentListProps) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun rendez-vous trouvé</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <AppointmentCard appointment={appointment} />
        </li>
      ))}
    </ul>
  );
};

export default AppointmentList;