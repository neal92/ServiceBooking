import React, { useState } from 'react';
import { PlusCircle, Filter, Calendar as CalendarIcon } from 'lucide-react';
import AppointmentList from '../components/appointments/AppointmentList';
import { mockAppointments } from '../data/mockData';
import NewAppointmentModal from '../components/appointments/NewAppointmentModal';

type AppointmentStatus = 'all' | 'upcoming' | 'ongoing' | 'past';

const Appointments = () => {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAppointments = mockAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    switch (statusFilter) {
      case 'upcoming':
        return appointmentDate > today;
      case 'ongoing':
        return appointmentDate.toDateString() === today.toDateString();
      case 'past':
        return appointmentDate < today;
      default:
        return true;
    }
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Mes Rendez-vous
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'upcoming'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'ongoing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              En cours
            </button>
            <button
              onClick={() => setStatusFilter('past')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === 'past'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Passés
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View Toggle (placeholder) */}
      <div className="flex justify-end mb-4">
        <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Vue Calendrier
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <AppointmentList appointments={filteredAppointments} />
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Appointments;