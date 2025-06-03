import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Appointment, Service } from '../../types';
import { serviceService, appointmentService } from '../../services/api';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
}

const NewAppointmentModal = ({ isOpen, onClose, appointment }: NewAppointmentModalProps) => {
  const [serviceId, setServiceId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Set form values when editing an appointment
  useEffect(() => {
    if (appointment) {
      setServiceId(appointment.serviceId.toString());
      setClientName(appointment.clientName);
      setClientEmail(appointment.clientEmail || '');
      setClientPhone(appointment.clientPhone || '');
      
      // Extract date and time from appointment.date
      const dateObj = new Date(appointment.date);
      setDate(dateObj.toISOString().split('T')[0]);
      setTime(appointment.time);
      setNotes(appointment.notes || '');
    } else {
      setServiceId('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setDate('');
      setTime('');
      setNotes('');
    }
  }, [appointment, isOpen]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError('Failed to load services');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Combine date and time
      const appointmentDate = new Date(`${date}T${time}`);
      
      const appointmentData = {
        serviceId: parseInt(serviceId),
        clientName,
        clientEmail,
        clientPhone,
        date: appointmentDate.toISOString(),
        time,
        status: 'pending' as 'pending', // Type assertion for status
        notes
      };

      if (appointment && appointment.id) {
        await appointmentService.update(appointment.id.toString(), appointmentData as any);
      } else {
        await appointmentService.create(appointmentData as any);
      }
      onClose();
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Failed to save appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Nouveau rendez-vous</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-3 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                    Prestation
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une prestation</option>
                    {mockServices.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} - {service.price}€
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Nom du client
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="clientName"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    Heure
                  </label>
                  <div className="mt-1">
                    <input
                      type="time"
                      name="time"
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Durée (minutes)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="15"
                      step="15"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Lieu
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;