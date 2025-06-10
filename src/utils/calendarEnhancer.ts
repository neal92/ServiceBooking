import { optimizeCalendarSpace } from './optimizeCalendarSpace';

/**
 * Améliore l'apparence et le comportement du calendrier FullCalendar
 * en ajoutant des fonctionnalités visuelles et interactives
 * @param {boolean} isMonthView - Indique si la vue actuelle est la vue mensuelle
 */
export function enhanceCalendar(isMonthView = false): void {
  try {
    // Optimisation de l'espace du calendrier (initial)
    optimizeCalendarSpace();
    
    // Effectuer les améliorations visuelles en séquence avec de petits délais
    setTimeout(() => {
      enhanceCurrentTimeIndicator();
      
      setTimeout(() => {
        enhanceDayHeaders();
        
        // Appliquer les améliorations spécifiques à la vue mensuelle si nécessaire
        if (isMonthView) {
          enhanceMonthView();
        }
        
        setTimeout(() => {
          enhanceNavigationButtons();
          
          setTimeout(() => {
            enhanceCalendarEvents();
            
            // Optimisation finale après un court délai
            setTimeout(() => {
              optimizeCalendarSpace();
            }, 100);
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  } catch (error) {
    console.error('Erreur lors de l\'amélioration du calendrier:', error);
  }
}

/**
 * Observer les changements de taille et contenu du calendrier de manière légère
 */
export function observeCalendarChanges(): void {
  try {
    const calendarEl = document.querySelector('.fc');
    if (!calendarEl) return;
    
    // Simplifier l'observateur pour éviter trop de déclenchements
    const observer = new MutationObserver((mutations) => {
      // Limiter la fréquence d'optimisation pour éviter les blocages
      if (mutations.length > 10) {
        return; // Eviter les traitements lourds en cas de nombreuses mutations
      }
      
      // Déclencher l'optimisation uniquement pour les changements significatifs
      const needsOptimization = mutations.some(mutation => 
        mutation.type === 'childList' || 
        (mutation.type === 'attributes' && 
         (mutation.attributeName === 'style' || mutation.attributeName === 'class'))
      );
      
      if (needsOptimization) {
        // Utiliser requestAnimationFrame pour synchroniser avec le cycle de rendu
        requestAnimationFrame(() => {
          optimizeCalendarSpace();
        });
      }
    });
    
    // Observer avec des options plus restrictives
    observer.observe(calendarEl, {
      childList: true,
      subtree: false, // Ne pas observer récursivement tous les enfants
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  } catch (error) {
    console.error('Erreur lors de l\'observation du calendrier:', error);
  }
}

/**
 * Améliore l'apparence de l'indicateur de l'heure actuelle
 */
export function enhanceCurrentTimeIndicator(): void {
  try {
    // Ajouter des styles globaux plutôt que de manipuler directement les éléments
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .fc-timegrid-now-indicator-line {
        border-color: #3b82f6 !important;
        border-width: 2px !important;
        z-index: 5 !important;
      }
      
      .fc-timegrid-now-indicator-arrow {
        border-color: #3b82f6 !important;
        border-radius: 50% !important;
        width: 8px !important;
        height: 8px !important;
        background-color: #3b82f6 !important;
        border: 2px solid #3b82f6 !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Ne pas ajouter d'animation ou d'effet supplémentaire pour éviter les ralentissements
  } catch (error) {
    console.error('Erreur lors de l\'amélioration de l\'indicateur de temps:', error);
  }
}

/**
 * Améliore l'apparence et le comportement des événements du calendrier
 */
function enhanceCalendarEvents(): void {
  try {
    // Ajouter des styles CSS globaux plutôt que de manipuler chaque événement individuellement
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .fc-event {
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 2px;
        min-height: 28px;
      }
      
      .fc-event:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        z-index: 10;
      }
      
      .fc-event-title {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.95rem;
        padding: 0 4px;
      }
      
      /* Styles spécifiques aux statuts */
      .event-status-confirmed {
        border-left: 4px solid #4CAF50;
      }
      
      .event-status-pending {
        border-left: 4px solid #FF9800;
      }
      
      .event-status-cancelled {
        border-left: 4px solid #F44336;
      }
      
      .event-status-completed {
        border-left: 4px solid #2196F3;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Effectuer un traitement minimal sur un nombre limité d'événements
    const events = document.querySelectorAll('.fc-event');
    const maxEventsToProcess = 50; // Limiter le nombre d'événements traités pour éviter les blocages
    
    // Traiter uniquement un nombre limité d'événements
    for (let i = 0; i < Math.min(maxEventsToProcess, events.length); i++) {
      const event = events[i];
      if (event instanceof HTMLElement) {
        // Déterminer le statut de l'événement
        const status = event.classList.contains('event-status-confirmed') ? 'confirmed' :
                      event.classList.contains('event-status-pending') ? 'pending' :
                      event.classList.contains('event-status-cancelled') ? 'cancelled' :
                      event.classList.contains('event-status-completed') ? 'completed' : null;
                      
        if (status) {
          // Ajouter seulement l'indicateur de statut sans manipulations complexes
          const statusColor = getStatusColor(status);
          
          // Créer un indicateur simple de statut en haut à droite si besoin
          if (!event.querySelector('.event-status-indicator')) {
            const eventContent = event.querySelector('.fc-event-main');
            if (eventContent instanceof HTMLElement) {
              const statusDot = document.createElement('div');
              statusDot.className = 'event-status-indicator';
              statusDot.style.cssText = `
                position: absolute;
                top: 2px;
                right: 4px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${statusColor};
                z-index: 5;
              `;
              eventContent.style.position = 'relative';
              eventContent.appendChild(statusDot);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'amélioration des événements du calendrier:', error);
  }
}

/**
 * Améliore l'apparence des en-têtes de jours
 */
function enhanceDayHeaders(): void {
  try {
    const dayHeaders = document.querySelectorAll('.fc-col-header-cell');
    if (dayHeaders.length === 0) return; // Ne rien faire si les éléments n'existent pas
    
    // Appliquer des styles partagés à tous les en-têtes en une seule fois via CSS
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .fc-col-header-cell {
        font-weight: 600;
        font-size: 1rem;
        padding: 8px 0;
        transition: background-color 0.3s ease;
      }
      
      .fc-col-header-cell:not(.fc-day-today):hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      
      .fc-col-header-cell.fc-day-today {
        background-color: rgba(59, 130, 246, 0.1);
        font-weight: 700;
        animation: pulse-subtle 2s infinite;
      }
      
      @keyframes pulse-subtle {
        0%, 100% { background-color: rgba(59, 130, 246, 0.1); }
        50% { background-color: rgba(59, 130, 246, 0.2); }
      }
      
      .fc-toolbar-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #1e40af;
      }
      
      .fc-day-today {
        background-color: rgba(59, 130, 246, 0.05);
        border-top: 3px solid rgba(59, 130, 246, 0.3);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Éviter les listeners d'événements qui peuvent créer des fuites mémoire
  } catch (error) {
    console.error('Erreur lors de l\'amélioration des en-têtes de jour:', error);
  }
}

/**
 * Améliore l'apparence des boutons de navigation
 */
function enhanceNavigationButtons(): void {
  try {
    // Ajouter des styles globaux pour les boutons plutôt que de manipuler chaque élément
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .fc-prev-button {
        border-radius: 8px 0 0 8px;
        font-size: 1.1rem;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        background-color: #f8fafc !important;
        border: 2px solid #3b82f6 !important;
      }
      
      .fc-next-button {
        border-radius: 0 8px 8px 0;
        font-size: 1.1rem;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        background-color: #f8fafc !important;
        border: 2px solid #3b82f6 !important;
      }

      .fc-prev-button .fc-icon,
      .fc-next-button .fc-icon {
        color: #3b82f6 !important;
        font-weight: bold !important;
        font-size: 1.2em !important;
      }
      
      .fc-today-button {
        border-radius: 8px;
        font-weight: 600;
        margin-right: 8px;
        font-size: 1rem;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        background-color: #f8fafc !important;
        border: 2px solid #3b82f6 !important;
        color: #3b82f6 !important;
        background-size: 200% 100%;
        background-image: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1));
        animation: todayButtonShimmer 3s infinite;
      }
      
      @keyframes todayButtonShimmer {
        0% { background-position: -100% 0; }
        100% { background-position: 200% 0; }
      }
      
      .fc-button-group button {
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }
      
      .fc-button-group button:hover,
      .fc-today-button:hover,
      .fc-prev-button:hover,
      .fc-next-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background-color: #eff6ff !important;
      }
      
      .dark .fc-prev-button,
      .dark .fc-next-button,
      .dark .fc-today-button {
        background-color: #1e293b !important;
        border: 2px solid #60a5fa !important;
      }
      
      .dark .fc-prev-button .fc-icon,
      .dark .fc-next-button .fc-icon,
      .dark .fc-today-button {
        color: #60a5fa !important;
      }
      
      .dark .fc-button-group button:hover,
      .dark .fc-today-button:hover,
      .dark .fc-prev-button:hover,
      .dark .fc-next-button:hover {
        background-color: #0f172a !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Plus besoin d'ajouter des gestionnaires d'événements sur chaque bouton
  } catch (error) {
    console.error('Erreur lors de l\'amélioration des boutons de navigation:', error);
  }
}

/**
 * Améliore l'apparence de la vue mensuelle en masquant les jours de la semaine
 */
export function enhanceMonthView(): void {
  try {
    // Ajouter des styles CSS pour la vue mensuelle
    const styleId = 'calendar-month-view-enhancements';
    
    // Ne créer le style que s'il n'existe pas déjà
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      // Styles pour la vue mensuelle
      styleElement.innerHTML = `
        /* Masquer complètement les noms des jours de la semaine dans la vue mensuelle */
        .fc-dayGridMonth-view .fc-col-header-cell .fc-col-header-cell-cushion,
        .calendar-month-view .fc-col-header-cell .fc-col-header-cell-cushion,
        .month-view-day-header .fc-col-header-cell-cushion {
          color: transparent !important;
          position: relative;
          opacity: 0.8; /* Légère transparence pour un effet visuel */
        }
        
        /* Afficher uniquement le numéro du jour */
        .fc-dayGridMonth-view .fc-col-header-cell .fc-col-header-cell-cushion::after,
        .calendar-month-view .fc-col-header-cell .fc-col-header-cell-cushion::after,
        .month-view-day-header .fc-col-header-cell-cushion::after {
          content: attr(data-date-num);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-weight: bold;
        }
        
        /* Réduire la hauteur des en-têtes en vue mensuelle */
        .fc-dayGridMonth-view .fc-col-header-cell,
        .calendar-month-view .fc-col-header-cell,
        .month-view-day-header {
          height: 32px !important; /* Réduire la hauteur pour ne montrer que le numéro */
        }
        
        /* S'assurer que les noms de jour sont vraiment cachés en utilisant plusieurs méthodes */
        .fc-dayGridMonth-view .fc-col-header .fc-col-header-cell span:first-child,
        .calendar-month-view .fc-col-header .fc-col-header-cell span:first-child,
        .month-view-day-header span:first-child {
          font-size: 0 !important;  /* Taille zéro pour le texte */
        }
        
        /* S'assurer que les noms de jour sont visibles dans les vues semaine et jour */
        .week-view-day-header .fc-col-header-cell-cushion,
        .day-view-day-header .fc-col-header-cell-cushion {
          color: inherit !important;
          font-size: inherit !important;
          visibility: visible !important;
        }
        
        /* Améliorer l'apparence des cellules de jour du mois */
        .fc-dayGridMonth-view .fc-daygrid-day {
          min-height: 6rem;
          transition: all 0.2s ease;
        }
        
        /* Effet au survol sur les cellules du mois */
        .fc-dayGridMonth-view .fc-daygrid-day:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        /* Style spécial pour aujourd'hui en vue mois */
        .fc-dayGridMonth-view .fc-day-today {
          background-color: rgba(59, 130, 246, 0.1);
          border-top: 2px solid rgba(59, 130, 246, 0.4);
        }
        
        /* Plus d'espace pour les événements en vue mois */
        .fc-dayGridMonth-view .fc-daygrid-event-harness {
          margin-top: 2px;
          margin-bottom: 2px;
        }
        
        /* Styles pour faire ressortir le numéro du jour */
        .fc-dayGridMonth-view .fc-daygrid-day-number {
          font-size: 1.1rem;
          font-weight: 600;
          padding: 6px 8px;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      // Ajouter un script qui ajoute les attributs data-date-num nécessaires
      setTimeout(() => {
        try {
          // Cibler tous les en-têtes de colonne dans la vue mois avec plusieurs sélecteurs
          const headers = document.querySelectorAll(
            '.fc-dayGridMonth-view .fc-col-header-cell, ' + 
            '.calendar-month-view .fc-col-header-cell, ' +
            '.month-view-day-header'
          );
          
          headers.forEach((header) => {
            const cushion = header.querySelector('.fc-col-header-cell-cushion');
            if (cushion instanceof HTMLElement) {
              // Extraire le numéro de jour du texte (1-31)
              const text = cushion.textContent || '';
              // Chercher uniquement les chiffres à la fin du texte pour éviter les problèmes avec les noms des jours
              const dayMatch = text.match(/\d+$/);
              const dayNumber = dayMatch ? dayMatch[0] : '';
              
              cushion.setAttribute('data-date-num', dayNumber);
            }
          });
        } catch (err) {
          console.error('Erreur lors de la configuration des en-têtes:', err);
        }
      }, 100);
    }
  } catch (error) {
    console.error('Erreur lors de l\'amélioration de la vue mensuelle:', error);
  }
}

/**
 * Masque complètement les noms des jours de la semaine dans toutes les vues
 */
export function hideWeekdayNames(): void {
  try {
    // Ne créer le style que s'il n'existe pas déjà
    const styleId = 'hide-weekday-names';
    
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      // Styles pour masquer complètement les noms des jours dans toutes les vues
      styleElement.innerHTML = `
        /* Masquer complètement les noms des jours de la semaine */
        .fc-col-header-cell-cushion {
          color: transparent !important;
          font-size: 0 !important;
        }
        
        /* S'assurer que tous les textes dans les en-têtes sont masqués */
        .fc-col-header-cell span.fc-col-header-cell-cushion {
          visibility: visible;
          opacity: 0;
        }
        
        /* Forcer le masquage dans tous les types de vue */
        .fc-timeGridWeek-view .fc-col-header-cell-cushion,
        .fc-timeGridDay-view .fc-col-header-cell-cushion,
        .fc-dayGridMonth-view .fc-col-header-cell-cushion,
        .fc-listWeek-view .fc-list-day-cushion {
          color: transparent !important;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      // Appliquer l'effet après un court délai pour s'assurer que les éléments sont chargés
      setTimeout(() => {
        const headers = document.querySelectorAll('.fc-col-header-cell-cushion');
        headers.forEach(header => {
          if (header instanceof HTMLElement) {
            header.style.color = 'transparent';
            header.style.fontSize = '0';
          }
        });
      }, 100);
    }
  } catch (error) {
    console.error('Erreur lors du masquage des noms des jours de la semaine:', error);
  }
}

/**
 * Retourne la couleur correspondant à un statut de rendez-vous
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed': return '#4CAF50'; // Vert
    case 'pending': return '#FF9800'; // Orange
    case 'cancelled': return '#F44336'; // Rouge
    case 'completed': return '#2196F3'; // Bleu
    default: return '#9E9E9E'; // Gris
  }
}