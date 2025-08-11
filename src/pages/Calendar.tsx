import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  Eye
} from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import { Link } from 'react-router-dom';
import { Appointment, Service } from '../types';
import { appointmentService, serviceService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../calendar-styles.css';

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Noms des mois et jours en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Fonction utilitaire pour normaliser les dates
  const normalizeDateString = (dateInput: string): string => {
    // Si c'est déjà au format YYYY-MM-DD, on le retourne tel quel
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateInput;
    }

    // Si c'est un timestamp ISO, on extrait la date en prenant en compte la timezone locale
    if (dateInput.includes('T')) {
      const date = new Date(dateInput);
      // Utiliser les méthodes locales pour éviter les problèmes de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      console.log(`🕐 Conversion date: ${dateInput} -> ${localDateStr}`);
      return localDateStr;
    }

    return dateInput;
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: log des appointments quand ils changent
  useEffect(() => {
    if (appointments.length > 0) {
      console.log(`🗓️ CALENDRIER: État mis à jour avec ${appointments.length} rendez-vous:`, appointments);
      console.log("🗓️ Dates des rendez-vous:", appointments.map(app => `${app.date} à ${app.time}`));
    }
  }, [appointments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let appointmentsData: Appointment[] = [];

      if (isAdmin) {
        console.log("🗓️ CALENDRIER: Admin - Récupération de TOUS les rendez-vous...");
        appointmentsData = await appointmentService.getAll();
        console.log(`📋 CALENDRIER: TOUS les rendez-vous récupérés: ${appointmentsData.length}`, appointmentsData);
      } else if (user?.email) {
        console.log(`🗓️ CALENDRIER: Récupération des rendez-vous pour ${user.email}...`);

        // Debug: récupérer d'abord tous les rendez-vous pour comparaison
        const allAppointments = await appointmentService.getAll();
        console.log(`📋 CALENDRIER: TOUS les rendez-vous disponibles: ${allAppointments.length}`, allAppointments);

        // Puis récupérer ceux du client
        appointmentsData = await appointmentService.getByClientEmail(user.email);
        console.log(`👤 CALENDRIER: Rendez-vous pour ${user.email}: ${appointmentsData.length}`, appointmentsData);
      }

      const servicesData = await serviceService.getAll();
      console.log(`🔧 CALENDRIER: Services récupérés: ${servicesData.length}`, servicesData);

      setAppointments(appointmentsData);
      setServices(servicesData);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Naviguer vers le mois précédent
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Naviguer vers le mois suivant
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Obtenir les rendez-vous pour une date donnée
  const getAppointmentsForDate = (date: Date) => {
    // Utiliser une date locale au lieu d'UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayAppointments = appointments.filter(appointment => {
      // Normaliser la date de l'appointment
      const appointmentDateStr = normalizeDateString(appointment.date);

      // Debug: comparaison détaillée
      console.log(`🔍 Comparaison: ${dateStr} === ${appointmentDateStr} (original: ${appointment.date}) ?`, dateStr === appointmentDateStr);
      return appointmentDateStr === dateStr;
    });

    // Debug: log des rendez-vous trouvés pour cette date
    console.log(`📅 Recherche rendez-vous pour ${dateStr}:`, dayAppointments.length, "trouvés");
    if (dayAppointments.length > 0) {
      console.log(`📅 Rendez-vous trouvés pour ${dateStr}:`, dayAppointments);
    }

    return dayAppointments;
  };

  // Générer le calendrier du mois
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days: Array<Date | null> = [];

    // Jours vides du début du mois
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Obtenir le statut CSS pour un jour
  const getDayStatus = (date: Date | null) => {
    if (!date) return '';

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dayAppointments = getAppointmentsForDate(date);
    const isSelected = selectedDate?.toDateString() === date.toDateString();

    // Debug: log pour voir si la fonction détecte les rendez-vous
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (dayAppointments.length > 0) {
      console.log(`🎨 getDayStatus pour ${dateStr}: ${dayAppointments.length} rendez-vous détectés`);
    }

    let classes = 'calendar-day ';

    if (isToday) {
      classes += 'today ';
    }

    if (isSelected) {
      classes += 'selected ';
    }

    if (dayAppointments.length > 0) {
      classes += 'has-appointments ';
      console.log(`🎨 Classes appliquées pour ${dateStr}: ${classes}`);
    }

    return classes;
  };

  const calendarDays = generateCalendarDays();
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendrier</h1>
          </div>
          <Link
            to="/app/appointments?action=new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rendez-vous
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden calendar-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={previousMonth}
                  className="month-nav-button dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={nextMonth}
                  className="month-nav-button dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* En-têtes des jours */}
              <div className="grid grid-cols-7">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="calendar-day-header bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="calendar-grid bg-gray-50 dark:bg-gray-900">
                {calendarDays.map((date, index) => (
                  <div
                    key={index}
                    className={
                      date
                        ? getDayStatus(date) + ' bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col justify-between items-center min-h-[90px] h-[90px]'
                        : 'calendar-day bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex flex-col justify-between items-center min-h-[90px] h-[90px]'
                    }
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className="p-2 w-full flex justify-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {date.getDate()}
                          </span>
                        </div>

                        {/* Indicateurs de rendez-vous */}
                        <div className="px-1 pb-1 w-full flex flex-col items-center">
                          {(() => {
                            const dayAppointments = getAppointmentsForDate(date);
                            return dayAppointments.slice(0, 2).map((appointment, idx) => {
                              const service = services.find(s => s.id === appointment.serviceId);
                              let statusBg = '';
                              let statusText = '';
                              switch (appointment.status) {
                                case 'pending':
                                  statusBg = 'bg-yellow-400 dark:bg-yellow-500'; statusText = 'text-yellow-900 dark:text-yellow-100'; break;
                                case 'confirmed':
                                  statusBg = 'bg-green-400 dark:bg-green-600'; statusText = 'text-green-900 dark:text-green-100'; break;
                                case 'in-progress':
                                  statusBg = 'bg-orange-400 dark:bg-orange-500'; statusText = 'text-orange-900 dark:text-orange-100'; break;
                                case 'completed':
                                  statusBg = 'bg-blue-400 dark:bg-blue-600'; statusText = 'text-blue-900 dark:text-blue-100'; break;
                                case 'cancelled':
                                  statusBg = 'bg-red-400 dark:bg-red-600'; statusText = 'text-red-900 dark:text-red-100'; break;
                                default:
                                  statusBg = 'bg-gray-100 dark:bg-gray-800'; statusText = 'text-gray-700 dark:text-gray-300';
                              }
                              return (
                                <div
                                  key={idx}
                                  className={`appointment-indicator ${appointment.status} ${statusBg} ${statusText} w-full text-center`}
                                  title={`${appointment.time} - ${service?.name || 'Service'}`}
                                >
                                  {service?.image && (
                                    <img
                                      src={service.image}
                                      alt={service.name}
                                      className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 mr-1"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  )}
                                  <span>{appointment.time} {service?.name?.substring(0, 10)}</span>
                                </div>
                              );
                            });
                          })()}

                          {getAppointmentsForDate(date).length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-1 w-full text-center">
                              +{getAppointmentsForDate(date).length - 2} autres
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panneau latéral - détails de la date sélectionnée */}
          <div className="lg:col-span-1">
            <div className="calendar-sidebar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <div className="sidebar-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedDate
                    ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`
                    : 'Sélectionnez une date'
                  }
                </h3>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Chargement...</p>
                  </div>
                ) : selectedDate ? (
                  selectedDateAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateAppointments.map((appointment) => {
                        const service = services.find(s => s.id === appointment.serviceId);
                        const statusColors: Record<string, string> = {
                          pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
                          confirmed: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
                          'in-progress': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
                          completed: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
                          cancelled: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                        };
                        return (
                          <div key={appointment.id} className="appointment-card">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                <span className="flex items-center space-x-2">
                                  {service?.image && (
                                    <img
                                      src={service.image}
                                      alt={service.name}
                                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 mr-2"
                                      style={{ objectFit: 'cover' }}
                                    />
                                  )}
                                  <span>{service?.name || 'Service inconnu'}</span>
                                </span>
                              </span>
                              <span className={`status-badge ${statusColors[appointment.status]}`}>
                                {appointment.status === 'pending' && 'En attente'}
                                {appointment.status === 'confirmed' && 'Confirmé'}
                                {appointment.status === 'in-progress' && 'En cours'}
                                {appointment.status === 'completed' && 'Terminé'}
                                {appointment.status === 'cancelled' && 'Annulé'}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.time}
                            </div>

                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4 mr-1" />
                              {appointment.clientName}
                            </div>
                          </div>
                        );
                      })}

                      <Link
                        to="/app/appointments"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir tous les rendez-vous
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun rendez-vous ce jour
                      </p>
                      <Link
                        to={`/app/appointments?action=new&date=${selectedDate!.toISOString().split('T')[0]}`}
                        className="inline-flex items-center px-3 py-1 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Prendre rendez-vous
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cliquez sur une date pour voir les détails
                    </p>
                  </div>
                )}
              </div>

              {/* Légende */}
              <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Légende</h4>
                <div className="space-y-2 text-sm">
                  <div className="legend-item">
                    <div className="legend-color bg-yellow-400" />
                    <span className="text-gray-700 dark:text-gray-300">En attente</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bg-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">Confirmé</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bg-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">En cours</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bg-blue-400" />
                    <span className="text-gray-700 dark:text-gray-300">Terminé</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bg-red-400" />
                    <span className="text-gray-700 dark:text-gray-300">Annulé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Calendar;
