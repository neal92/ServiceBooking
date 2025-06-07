import { useEffect } from 'react';
import { Appointment } from '../types';

/**
 * Custom hook pour ajouter des tooltips aux événements du calendrier
 * @param calendarElRef Référence à l'élément du calendrier FullCalendar
 */
const useCalendarEventTooltips = (calendarElRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!calendarElRef.current) return;
    
    // Fonction pour générer le contenu HTML du tooltip
    const createTooltipContent = (appointment: Appointment, serviceName: string) => {
      const status = appointment.status || 'pending';
      const date = new Date(appointment.date).toLocaleDateString('fr-FR');
      const phone = appointment.clientPhone || 'Non spécifié';
      const email = appointment.clientEmail || 'Non spécifié';
      
      const statusLabels: Record<string, string> = {
        'confirmed': 'Confirmé',
        'pending': 'En attente',
        'cancelled': 'Annulé',
        'completed': 'Terminé'
      };
      
      const statusClasses: Record<string, string> = {
        'confirmed': 'bg-green-100 text-green-800',
        'pending': 'bg-orange-100 text-orange-800',
        'cancelled': 'bg-red-100 text-red-800',
        'completed': 'bg-blue-100 text-blue-800'
      };
      
      const statusLabel = statusLabels[status] || 'Inconnu';
      const statusClass = statusClasses[status] || 'bg-gray-100 text-gray-800';
      
      return `
        <div class="flex items-center justify-between mb-2 border-b pb-2">
          <span class="font-bold">${appointment.clientName}</span>
          <span class="text-xs px-2 py-1 rounded-full ${statusClass}">
            ${statusLabel}
          </span>
        </div>
        <p class="mb-1 text-sm"><strong>Service:</strong> ${serviceName}</p>
        <p class="mb-1 text-sm"><strong>Date:</strong> ${date} à ${appointment.time}</p>
        <p class="mb-1 text-sm"><strong>Téléphone:</strong> ${phone}</p>
        <p class="text-sm"><strong>Email:</strong> ${email}</p>
        ${appointment.notes ? `<div class="mt-2 pt-2 border-t text-xs text-gray-500">${appointment.notes}</div>` : ''}
      `;
    };
    
    // Observer les événements du calendrier ajoutés au DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Pour chaque nouveau nœud, vérifier s'il s'agit d'un événement du calendrier
          mutation.addedNodes.forEach((node: Node) => {
            if (node instanceof HTMLElement && node.classList.contains('fc-event')) {
              // Récupérer l'ID de l'événement
              const eventId = node.getAttribute('data-event-id');
              
              if (eventId) {
                // Ajouter l'écouteur d'événements pour afficher le tooltip
                node.addEventListener('mouseenter', (e) => {
                  // Trouver les détails de l'événement
                  const fcEventEl = node.querySelector('.fc-event-main');
                  if (fcEventEl) {
                    // Récupérer les données de l'événement
                    const appointmentData = fcEventEl.getAttribute('data-appointment');
                    const serviceName = fcEventEl.getAttribute('data-service') || 'Sans service';
                    
                    if (appointmentData) {
                      try {
                        const appointment = JSON.parse(appointmentData) as Appointment;
                        
                        // Créer le tooltip
                        const tooltip = document.createElement('div');
                        tooltip.className = 'calendar-tooltip bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-50';
                        tooltip.innerHTML = createTooltipContent(appointment, serviceName);
                        
                        // Positionner et afficher le tooltip
                        document.body.appendChild(tooltip);
                        tooltip.style.position = 'absolute';
                        tooltip.style.zIndex = '10000';
                        
                        const rect = node.getBoundingClientRect();
                        tooltip.style.left = `${rect.right + 10}px`;
                        tooltip.style.top = `${rect.top + window.scrollY}px`;
                        
                        // Stocker une référence au tooltip
                        (node as any).__tooltip = tooltip;
                      } catch (e) {
                        console.error('Error parsing appointment data', e);
                      }
                    }
                  }
                });
                
                // Supprimer le tooltip quand la souris quitte l'événement
                node.addEventListener('mouseleave', () => {
                  const tooltip = (node as any).__tooltip;
                  if (tooltip && tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                    (node as any).__tooltip = null;
                  }
                });
              }
            }
          });
        }
      });
    });
    
    // Observer les changements dans le conteneur du calendrier
    observer.observe(calendarElRef.current, {
      childList: true,
      subtree: true
    });
    
    // Nettoyer l'observer lors du démontage
    return () => {
      observer.disconnect();
    };
  }, [calendarElRef]);
};

export default useCalendarEventTooltips;
