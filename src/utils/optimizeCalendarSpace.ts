// Fonction pour optimiser l'espace du calendrier
export function optimizeCalendarSpace() {
  try {
    // Utiliser requestAnimationFrame pour synchroniser avec le cycle de rendu
    requestAnimationFrame(() => {
      // Ajouter des styles globaux plutôt que de manipuler chaque élément
      const styleId = 'calendar-optimization-styles';
      
      // Ne pas créer de nouveau style si déjà présent
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        
        // Définir tous les styles nécessaires en un seul élément
        styleElement.innerHTML = `
          .fc {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
          }
          
          .fc-view-harness {
            flex: 1 !important;
            min-height: 0 !important;
          }
          
          .fc-scrollgrid {
            height: 100% !important;
          }
          
          .fc-scrollgrid-section-body {
            height: 100% !important;
          }
          
          .fc-scroller {
            overflow: auto !important;
          }
          
          /* Hauteurs pour différentes tailles d'écran */
          @media screen and (max-height: 700px) {
            .fc-timegrid-slot {
              height: 2.6rem !important;
            }
          }
          
          @media screen and (min-height: 701px) and (max-height: 900px) {
            .fc-timegrid-slot {
              height: 3.0rem !important;
            }
          }
          
          @media screen and (min-height: 901px) {
            .fc-timegrid-slot {
              height: 3.5rem !important;
            }
            
            .fc-col-header-cell {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
              font-size: 1.05rem !important;
            }
          }
        `;
        
        document.head.appendChild(styleElement);
      }
      
      // Force le recalcul de la mise en page avec un délai minimal
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 5);
    });
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'espace calendrier:', error);
  }
}
