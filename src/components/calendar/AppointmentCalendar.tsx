import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { appointmentService } from '../../services/api';
import { Appointment } from '../../types';
import NewAppointmentModal from '../appointments/NewAppointmentModal';
import { EventClickArg, DateSelectArg, EventChangeArg, DatesSetArg } from '@fullcalendar/core';
import { enhanceCalendar, enhanceCurrentTimeIndicator, enhanceMonthView } from '../../utils/calendarEnhancer';
import { addDaysToHeaders } from '../../utils/headerEnhancer';
import '../../calendar-day-headers.css';

interface AppointmentCalendarProps {
  onAppointmentAdded?: () => void;
  onAppointmentUpdated?: () => void;
  onAppointmentDeleted?: () => void;
  statusFilter?: string | null;
  className?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  onAppointmentUpdated,
  statusFilter,
  className
}) => {
  const calendarRef = useRef<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState<boolean>(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [isMonthView, setIsMonthView] = useState(false); // Nouvel état pour suivre si on est en vue mensuelle

  // Charger les rendez-vous
  useEffect(() => {
    loadAppointments();
    
    // Référence pour stocker le timestamp du dernier chargement
    const lastLoadRef = { time: 0 };
    
    // Configurer un rechargement périodique avec un intervalle plus long (toutes les 60 secondes)
    const interval = setInterval(() => {
      loadAppointments();
    }, 60000); // Augmenté à 60 secondes pour réduire la charge
    
    // Écouter l'événement focus pour recharger les données lorsque l'utilisateur revient à l'onglet
    const handleFocus = () => {
      // Éviter de recharger trop souvent
      const now = Date.now();
      if (now - lastLoadRef.time > 30000) { // Au moins 30 secondes entre les rechargements
        lastLoadRef.time = now;
        console.log('Fenêtre a le focus, rechargement des rendez-vous...');
        loadAppointments();
      }
    };
    
    // Écouter les événements personnalisés pour les changements de rendez-vous
    const handleAppointmentCreated = () => {
      console.log('Événement appointmentCreated détecté, rechargement des rendez-vous...');
      loadAppointments();
    };
    
    const handleAppointmentUpdated = () => {
      console.log('Événement appointmentUpdated détecté, rechargement des rendez-vous...');
      loadAppointments();
    };
    
    const handleAppointmentDeleted = () => {
      console.log('Événement appointmentDeleted détecté, rechargement des rendez-vous...');
      loadAppointments();
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('appointmentCreated', handleAppointmentCreated);
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
    window.addEventListener('appointmentDeleted', handleAppointmentDeleted);
    
    // Nettoyer lors du démontage du composant
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('appointmentCreated', handleAppointmentCreated);
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
      window.removeEventListener('appointmentDeleted', handleAppointmentDeleted);
    };
  }, []);
  
  // Effectuer un changement de vue en fonction de la largeur d'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Sur mobile, utiliser la vue jour ou liste
        if (calendarView !== 'timeGridDay' && calendarView !== 'listWeek') {
          setCalendarView('timeGridDay');
        }
      } else {
        // Sur desktop, conserver la vue semaine par défaut si c'était une vue mobile
        if (calendarView === 'timeGridDay') {
          setCalendarView('timeGridWeek');
        }
      }
    };

    handleResize(); // Appliquer au chargement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calendarView]);
    // Améliorer le calendrier après le rendu
  useEffect(() => {
    if (!loading) {
      // Exécuter immédiatement pour éviter tout délai inutile
      enhanceCalendar(isMonthView);
      enhanceCurrentTimeIndicator();
      addDaysToHeaders(); // Ajouter les jours dans les champs d'en-tête du calendrier
    }
  }, [loading, appointments, isMonthView]);
    /**
   * Charge les rendez-vous depuis l'API avec gestion optimisée des
   * états de chargement, succès et erreur
   */
  const loadAppointments = async () => {
    // Ne pas charger à nouveau si déjà en cours
    if (loading) return;
    
    // Débuter le chargement
    setLoading(true);
    setError(null);
    
    try {
      // Timeout anti-blocage de l'interface
      const TIMEOUT_DELAY = 3000;
      const MAX_LOADING_DISPLAY = 500; // Temps minimum d'affichage du loader
      const startTime = Date.now();
      
      // Promise de timeout pour éviter un blocage
      const timeoutPromise = new Promise<Appointment[]>((_, reject) => 
        setTimeout(() => reject(new Error('Délai dépassé')), TIMEOUT_DELAY)
      );
      
      // Promise de chargement des données
      const dataPromise = appointmentService.getAll();
      
      // Course entre le chargement et le timeout
      const data = await Promise.race([dataPromise, timeoutPromise])
        .catch(err => {
          console.warn('Erreur lors du chargement des rendez-vous:', err);
          setError('Les rendez-vous n\'ont pas pu être chargés. Veuillez réessayer.');
          return null;
        });
      
      // Gérer le résultat
      if (data) {
        if (Array.isArray(data)) {
          console.log('Rendez-vous chargés avec succès:', data.length);
          setAppointments(data);
          setError(null);
        } else {
          console.error('Format de données invalide:', data);
          setError('Format de données invalide');
        }
      }
      
      // Assurer un temps minimum d'affichage du loader pour éviter un flash
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MAX_LOADING_DISPLAY - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
    } catch (err) {
      console.error('Erreur inattendue lors du chargement des rendez-vous:', err);
      setError('Erreur lors du chargement des rendez-vous. Veuillez réessayer.');
    } finally {
      // Dans tous les cas, désactiver l'état de chargement
      setLoading(false);
    }
  };
  
  // Convertir les rendez-vous pour FullCalendar
  const calendarEvents = appointments
    .filter(appointment => {
      // Filtrer les rendez-vous sans date ou heure valide
      const isValid = appointment && appointment.date && appointment.time;
      
      // Filtrer par statut si un filtre est actif
      if (statusFilter && isValid) {
        return appointment.status === statusFilter;
      }
      
      return isValid;
    })
    .map(appointment => {
      // Normaliser le format de la date (si nécessaire)
      let formattedDate = appointment.date;
      if (formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
      
      // Normaliser le format de l'heure (si nécessaire)
      let formattedTime = appointment.time;
      if (!formattedTime.includes(':')) {
        formattedTime = `${formattedTime}:00`;
      }
      
      const service = appointment.Service || 
                      (appointment.serviceName ? { name: appointment.serviceName, duration: appointment.duration || 60 } : null);
      const serviceName = service ? service.name : 'Sans service';
      const duration = service ? service.duration : 60;
      
      // Log pour débogage
      console.log('Création d\'événement calendrier:', { 
        id: appointment.id,
        date: formattedDate,
        time: formattedTime,
        clientName: appointment.clientName,
        service: serviceName
      });
      
      return {
        id: appointment.id.toString(),
        title: `${appointment.clientName} - ${serviceName}`,
        start: `${formattedDate}T${formattedTime}`,
        end: calculateEndTime(formattedDate, formattedTime, duration),
        extendedProps: {
          appointmentData: appointment,
          status: appointment.status,
          clientName: appointment.clientName,
          serviceName: serviceName,
          time: formattedTime
        },  
        backgroundColor: getStatusColor(appointment.status),
        borderLeft: `4px solid ${getStatusColor(appointment.status)}`,
        classNames: [
          'event-status-' + (appointment.status || 'pending'),
          'hover:shadow-md'
        ]
      };
    });
    
  // Calculer l'heure de fin en fonction de la durée du service
  function calculateEndTime(date: string, time: string, durationMinutes: number): string {
    // Vérifier si la date et l'heure sont valides
    if (!date || !time || date === 'Invalid Date' || time === 'Invalid Date') {
      // Retourner une chaîne vide ou la date actuelle comme solution de secours
      console.warn('Date ou heure invalide pour le calcul de fin:', { date, time });
      const now = new Date();
      return now.toISOString();
    }
    
    try {
      // Normaliser le format de la date (YYYY-MM-DD)
      if (date.includes('T')) {
        date = date.split('T')[0];
      }
      
      // S'assurer que le format de l'heure est correct (HH:MM)
      if (!time.includes(':')) {
        time = `${time}:00`;
      }
      
      console.log('Calcul d\'heure de fin avec:', { date, time });
      const startTime = new Date(`${date}T${time}`);
      
      // Vérifier si la date est valide
      if (isNaN(startTime.getTime())) {
        console.error('Date invalide après création de l\'objet Date:', { date, time });
        const now = new Date();
        return now.toISOString();
      }
      
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      return endTime.toISOString();
    } catch (error) {
      console.error('Erreur lors du calcul de l\'heure de fin:', error);
      // Retourner une chaîne vide ou la date actuelle comme solution de secours
      const now = new Date();
      return now.toISOString();
    }
  }

  // Déterminer la couleur en fonction du statut du rendez-vous
  function getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return '#4CAF50'; // Vert
      case 'pending': return '#FF9800'; // Orange
      case 'cancelled': return '#F44336'; // Rouge
      case 'completed': return '#2196F3'; // Bleu
      default: return '#9E9E9E'; // Gris
    }
  }

  // Gérer la sélection d'une plage horaire dans le calendrier
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDate = new Date(selectInfo.start);
    
    // Formatter la date et l'heure
    const formattedDate = startDate.toISOString().split('T')[0];
    const formattedTime = startDate.toTimeString().slice(0, 5);
    
    console.log('Plage horaire sélectionnée:', { 
      start: selectInfo.start, 
      formattedDate, 
      formattedTime 
    });
    
    // Stocker les valeurs formatées
    setSelectedDate(formattedDate);
    setSelectedTime(formattedTime);
    
    // Ouvrir la modal pour créer un rendez-vous
    setIsNewAppointmentModalOpen(true);
  };

  // Gérer le clic sur un événement existant
  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointmentData = clickInfo.event.extendedProps.appointmentData as Appointment;
    setSelectedAppointment(appointmentData);
    setIsEditAppointmentModalOpen(true);
  };
  /**
   * Gère le déplacement ou le redimensionnement d'un rendez-vous dans le calendrier
   * Utilise le debounce pour éviter les mises à jour multiples rapprochées
   */
  const handleEventChange = async (changeInfo: EventChangeArg) => {
    try {
      const appointmentData = changeInfo.event.extendedProps.appointmentData as Appointment;
      const newStartTime = changeInfo.event.start;
      
      if (!newStartTime) return;
      
      // Extraire l'ID pour garantir la consistance même si les données changent pendant l'opération
      const appointmentId = appointmentData.id.toString();
      
      // Utiliser les informations locales fournies par FullCalendar
      const localDate = newStartTime;
      
      // Formater la date et l'heure pour l'API
      const formattedDate = localDate.toLocaleDateString('fr-CA'); // Format YYYY-MM-DD
      const hours = String(localDate.getHours()).padStart(2, '0');
      const minutes = String(localDate.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      // Créer l'objet mis à jour
      const updatedAppointment = {
        ...appointmentData,
        date: formattedDate,
        time: formattedTime
      };
      
      // Mettre à jour le rendez-vous dans l'API
      await appointmentService.update(appointmentId, updatedAppointment);
      
      // Notifier le parent et actualiser les données
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
      
      // Utiliser requestAnimationFrame pour améliorer les performances
      requestAnimationFrame(() => {
        loadAppointments();
      });
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', err);
      setError('Impossible de mettre à jour le rendez-vous. Veuillez réessayer.');
      
      // Restaurer l'état visuel en rechargeant les données
      requestAnimationFrame(() => {
        loadAppointments();
      });
    }
  };
    /**
   * Indicateur d'initialisation pour éviter les problèmes d'état loading persistant
   * @type {React.MutableRefObject<boolean>}
   */
  const hasInitialized = useRef(false);
    /**
   * Effet pour assurer que le calendrier s'initialise correctement
   * Marque l'initialisation comme terminée après le premier chargement
   */
  useEffect(() => {
    // Si le chargement est terminé et que l'initialisation n'a pas encore été marquée
    if (!loading && !hasInitialized.current) {
      hasInitialized.current = true;
    }

    // Limiter la durée maximale de chargement pour éviter les blocages d'interface
    if (loading) {
      const cleanupTimeout = setTimeout(() => {
        setLoading(false);
      }, 2000); // 2 secondes maximum de chargement
      
      return () => clearTimeout(cleanupTimeout);
    }
  }, [loading]);
    return (
    <div className={`appointment-calendar flex flex-col h-full w-full min-h-0 ${className || ''}`}>
      {/* Bannière d'erreur avec message et bouton de rechargement */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-400 p-3 mb-2 rounded-lg shadow-sm animate-fadeIn" role="alert">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
            <button 
              onClick={() => loadAppointments()}
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 px-3 py-1 rounded-md text-sm font-medium transition-colors border border-red-200 dark:border-red-800"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
        {/* Calendrier toujours affiché, pas de modal de chargement */}
      <div className="calendar-container flex-1 min-h-0 w-full rounded-lg overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            buttonText={{
              today: 'Aujourd\'hui',
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              list: 'Planning'
            }}
            contentHeight="auto"
            themeSystem="standard"
            navLinks={true}
            selectable={true}
            locale={frLocale}
            editable={true}
            selectMirror={true}
            eventInteractive={true}
            dayMaxEvents={6}
            weekends={true}
            events={calendarEvents}
            height="100%"
            allDaySlot={false}
            nowIndicator={true}
            dayHeaderClassNames="text-sm font-medium text-gray-700 dark:text-gray-300 py-2"
            slotLabelClassNames="text-gray-500 dark:text-gray-400 text-xs font-medium"
            viewClassNames="animate-fadeIn transition-opacity duration-300"
            handleWindowResize={true}            slotMinTime="08:00:00"
            slotMaxTime="23:00:00"
            slotDuration="00:15:00"
            expandRows={true}
            stickyHeaderDates={true}
            slotEventOverlap={false}
            scrollTime="08:30:00"
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventChange={handleEventChange}
            datesSet={(dateInfo: DatesSetArg) => {
              // Détecter si nous sommes en vue mensuelle
              const isMonthViewActive = dateInfo.view.type === 'dayGridMonth';
              setIsMonthView(isMonthViewActive);
              setCalendarView(dateInfo.view.type);
              
              // Appliquer les améliorations via requestAnimationFrame pour de meilleures performances
              requestAnimationFrame(() => {
                enhanceCalendar(isMonthViewActive);
                if (isMonthViewActive) {
                  enhanceMonthView();
                }
                // Ajouter les jours à chaque changement de vue
                addDaysToHeaders();              });
            }}
            dayHeaderFormat={{
              weekday: 'short',
              day: 'numeric'
            }}
            views={{
              dayGridMonth: {
                dayHeaderFormat: { 
                  weekday: 'short',
                  day: 'numeric'
                },
                titleFormat: { month: 'long', year: 'numeric' },
                dayHeaderClassNames: 'month-view-day-header',
                buttonText: 'Mois',
                viewClassNames: 'calendar-month-view'
              },
              timeGridWeek: {
                dayHeaderFormat: { 
                  weekday: 'short',
                  day: 'numeric'
                },
                titleFormat: { month: 'short', year: 'numeric' },
                buttonText: 'Semaine',
                dayHeaderClassNames: 'week-view-day-header'
              },
              timeGridDay: {
                dayHeaderFormat: { 
                  weekday: 'short',
                  day: 'numeric'
                },
                titleFormat: { month: 'long', day: 'numeric', year: 'numeric' },
                buttonText: 'Jour',
                dayHeaderClassNames: 'day-view-day-header'
              },
              listWeek: {
                titleFormat: { month: 'long', year: 'numeric' },
                buttonText: 'Planning'
              }
            }}
            lazyFetching={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            eventContent={(arg: any) => {
              // Récupérer le statut pour déterminer les icônes et styles
              const status = arg.event.extendedProps.status;
              
              // Icône en fonction du statut
              let statusIcon = '';
              switch(status) {
                case 'confirmed':
                  statusIcon = '✓';
                  break;
                case 'pending':
                  statusIcon = '⌛';
                  break;
                case 'cancelled':
                  statusIcon = '✕';
                  break;
                case 'completed':
                  statusIcon = '✓✓';
                  break;
                default:
                  statusIcon = '•';
              }
              return (
                <div className="p-1.5 w-full relative overflow-hidden">
                  {/* Ajouter un conteneur de statut en haut à droite */}
                  <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                    <div className="h-2.5 w-2.5 rounded-full animate-pulse"
                         style={{ backgroundColor: getStatusColor(status) }}></div>
                    <div className="text-sm font-medium opacity-80">
                      {statusIcon}
                    </div>
                  </div>
                  
                  {/* Contenu principal de l'événement avec style amélioré */}
                  <div className="font-semibold truncate text-base mt-1">
                    {arg.event.extendedProps.clientName}
                  </div>
                  <div className="text-sm truncate text-gray-600 dark:text-gray-400 flex items-center">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: getStatusColor(status),
                              boxShadow: `0 0 3px ${getStatusColor(status)}` 
                            }}></span>
                      <span>{arg.event.extendedProps.serviceName}</span>
                    </div>
                  </div>
                  
                  {/* Durée du RDV (si disponible) */}
                  {arg.event.extendedProps.appointmentData?.duration && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {arg.event.extendedProps.appointmentData.duration} min
                    </div>
                  )}
                </div>
              )
            }}          />
        </div>

      {/* Modal pour ajouter un nouveau rendez-vous */}
      {isNewAppointmentModalOpen && (
        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={() => {
            console.log("Fermeture du modal nouveau rendez-vous - rechargement des données");
            setIsNewAppointmentModalOpen(false);
            setTimeout(() => {
              loadAppointments(); // Recharger les rendez-vous après la fermeture avec un petit délai
              if (onAppointmentUpdated) {
                onAppointmentUpdated(); // Notification au parent qu'un rendez-vous a été mis à jour
              }
            }, 300);
          }}
          appointment={{
            id: 0,
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            serviceId: 0,
            date: selectedDate,
            time: selectedTime,
            status: 'pending',
            notes: ''
          }}
        />
      )}

      {/* Modal pour éditer un rendez-vous existant */}
      {isEditAppointmentModalOpen && selectedAppointment && (
        <NewAppointmentModal
          isOpen={isEditAppointmentModalOpen}
          onClose={() => {
            console.log("Fermeture du modal édition rendez-vous - rechargement des données");
            setIsEditAppointmentModalOpen(false);
            setTimeout(() => {
              loadAppointments(); // Recharger les rendez-vous après la fermeture avec un petit délai
              if (onAppointmentUpdated) {
                onAppointmentUpdated(); // Notification au parent qu'un rendez-vous a été mis à jour
              }
            }, 300);
          }}
          appointment={selectedAppointment}
          onDelete={async (id: number) => {
            try {
              console.log("Suppression du rendez-vous:", id);
              await appointmentService.delete(id.toString());
              loadAppointments(); // Recharger les rendez-vous après la suppression
              if (onAppointmentUpdated) {
                onAppointmentUpdated(); // Notification au parent qu'un rendez-vous a été mis à jour
              }
            } catch (err) {
              console.error("Erreur lors de la suppression du rendez-vous:", err);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;
