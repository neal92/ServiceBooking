import React, { useState } from 'react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';

const Calendar = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour forcer le rechargement du calendrier
  const handleAppointmentUpdated = () => {
    console.log("Mise à jour du calendrier depuis la page parente");
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier des rendez-vous</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultez, ajoutez ou modifiez vos rendez-vous dans le calendrier.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-[700px]">
          <AppointmentCalendar 
            key={refreshKey}
            onAppointmentUpdated={handleAppointmentUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
