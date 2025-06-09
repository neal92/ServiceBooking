// Script pour améliorer l'apparence et l'interaction avec le calendrier
// Ce script doit être injecté après le chargement du calendrier

export const enhanceCalendar = () => {
  // Attendre que le calendrier soit complètement chargé
  setTimeout(() => {
    // Améliorer les événements du calendrier
    enhanceCalendarEvents();
    
    // Améliorer l'affichage sur mobile
    enhanceMobileView();
    
    // Observer les changements futurs dans le calendrier
    observeCalendarChanges();
  }, 300);
};

// Améliorer l'apparence et l'interaction des événements
function enhanceCalendarEvents() {
  const eventElements = document.querySelectorAll('.fc-event');
  
  eventElements.forEach(eventEl => {
    if (!(eventEl instanceof HTMLElement)) return;
    
    // Améliorer l'apparence générale
    eventEl.classList.add(
      'hover:shadow-lg',
      'transition-all',
      'duration-200',
      'rounded-lg',
      'border-l-4'
    );
    
    // Améliorer l'interaction au survol
    eventEl.style.cursor = 'pointer';
    
    // Extraire le statut depuis le backgroundColor et ajouter une classe appropriée
    const style = window.getComputedStyle(eventEl);
    const backgroundColor = style.backgroundColor;
    
    if (backgroundColor.includes('76, 175, 80') || backgroundColor.includes('4CAF50')) {
      eventEl.classList.add('event-status-confirmed');
      eventEl.style.borderColor = '#4CAF50';
    } else if (backgroundColor.includes('255, 152, 0') || backgroundColor.includes('FF9800')) {
      eventEl.classList.add('event-status-pending');
      eventEl.style.borderColor = '#FF9800';
    } else if (backgroundColor.includes('244, 67, 54') || backgroundColor.includes('F44336')) {
      eventEl.classList.add('event-status-cancelled');
      eventEl.style.borderColor = '#F44336';
    } else if (backgroundColor.includes('33, 150, 243') || backgroundColor.includes('2196F3')) {
      eventEl.classList.add('event-status-completed');
      eventEl.style.borderColor = '#2196F3';
    }

    // Améliorer la lisibilité du contenu
    const contentEl = eventEl.querySelector('.fc-event-main');
    if (contentEl instanceof HTMLElement) {
      contentEl.style.padding = '0.5rem';
      contentEl.style.lineHeight = '1.2';
    }

    // Ajouter des effets interactifs
    eventEl.addEventListener('mouseenter', () => {
      eventEl.style.transform = 'scale(1.02)';
      eventEl.style.zIndex = '5';
    });

    eventEl.addEventListener('mouseleave', () => {
      eventEl.style.transform = 'scale(1)';
      eventEl.style.zIndex = '1';
    });
  });
}

// Améliorer l'affichage sur mobile
function enhanceMobileView() {
  if (window.innerWidth < 640) {
    // Simplifier l'affichage sur mobile
    const headerToolbar = document.querySelector('.fc-header-toolbar');
    if (headerToolbar instanceof HTMLElement) {
      headerToolbar.classList.add('flex', 'flex-col', 'gap-2');
    }
    
    // Réduire la taille des textes
    const eventTitles = document.querySelectorAll('.fc-event-title');
    eventTitles.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.fontSize = '0.75rem';
      }
    });
  }
}

// Observer les changements dans le calendrier pour appliquer les améliorations aux nouveaux éléments
function observeCalendarChanges() {
  const calendarEl = document.querySelector('.fc');
  if (!calendarEl) return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        enhanceCalendarEvents();
        enhanceMobileView();
      }
    });
  });
  
  observer.observe(calendarEl, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

// Fonction pour ajouter une indication de l'heure actuelle plus visible
export const enhanceCurrentTimeIndicator = () => {
  const timeIndicator = document.querySelector('.fc-timeline-now-indicator-line');
  if (timeIndicator instanceof HTMLElement) {
    timeIndicator.style.borderColor = '#3b82f6';
    timeIndicator.style.borderWidth = '2px';
    timeIndicator.style.zIndex = '5';
  }
  
  const timeLabel = document.querySelector('.fc-timeline-now-indicator-arrow');
  if (timeLabel instanceof HTMLElement) {
    timeLabel.style.borderColor = '#3b82f6';
    timeLabel.style.backgroundColor = '#3b82f6';
  }
};
