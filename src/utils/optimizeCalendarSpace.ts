/**
 * Optimise l'espace du calendrier en appliquant des styles CSS
 * pour maximiser l'utilisation de l'espace disponible
 */
export function optimizeCalendarSpace(): void {
  try {
    // Identifiant unique pour le style d'optimisation du calendrier
    const styleId = 'calendar-optimization-styles';
    
    // Vérifier si les styles sont déjà présents pour éviter des manipulations DOM inutiles
    if (document.getElementById(styleId)) {
      return; // Les styles sont déjà appliqués
    }
    
    // Créer l'élément de style une seule fois
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    
    // Appliquer tous les styles nécessaires en un seul batch
    styleElement.innerHTML = `
      /* Styles d'optimisation du calendrier */
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
      }      .fc-scroller {
        overflow: auto !important;
        max-height: none !important;
      }
      
      /* Assurer un défilement complet pour voir toutes les heures */
      .fc-timegrid-body {
        overflow-y: auto !important;
        max-height: none !important;
      }
      
      /* Permettre au conteneur de défiler pour montrer toutes les heures */
      .fc-timegrid-slots {
        min-height: 100% !important;
      }
      
      /* Améliorer l'expérience de défilement vertical */
      .fc-timegrid-slots table {
        height: auto !important;
      }
      
      /* S'assurer que les en-têtes des jours restent visibles pendant le défilement */
      .fc-timegrid-axis-chunk,
      .fc-timegrid-cols,
      .fc-timegrid-col-frame {
        height: 100% !important;
      }
      
      /* Barre de défilement personnalisée */
      .fc-scroller::-webkit-scrollbar {
        width: 8px;
      }
      
      .fc-scroller::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      
      .fc-scroller::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      
      .fc-scroller::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      /* Mode sombre pour la barre de défilement */
      .dark .fc-scroller::-webkit-scrollbar-track {
        background: #1e293b;
      }
      
      .dark .fc-scroller::-webkit-scrollbar-thumb {
        background: #475569;
      }
      
      .dark .fc-scroller::-webkit-scrollbar-thumb:hover {
        background: #64748b;
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
    
    // Ajouter les styles au document
    document.head.appendChild(styleElement);
    
    // Force le recalcul de la mise en page
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'espace calendrier:', error);
  }
}
