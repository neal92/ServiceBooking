/**
 * Fichier d'utilitaire pour améliorer l'affichage des en-têtes du calendrier
 * Ajoute les jours de la semaine dans les champs d'en-tête
 */

/**
 * Ajoute les jours de la semaine dans les champs d'en-tête du calendrier
 * Le format d'affichage sera "Jour JJ" (ex: Lun 15)
 */
export function addDaysToHeaders(): void {
  try {
    // Noms des jours de la semaine en français (format court)
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    // Sélectionner tous les en-têtes de jour
    const dayHeaders = document.querySelectorAll('.fc-col-header-cell');
    
    if (!dayHeaders.length) {
      return; // Pas d'en-têtes trouvés
    }
    
    // Créer un style personnalisé pour les en-têtes de jour
    const styleId = 'calendar-day-headers-style';
    
    // Vérifier si le style existe déjà
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      styleElement.innerHTML = `
        /* Style pour les en-têtes de jour */
        .fc-col-header-cell-cushion {
          color: #333 !important;
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          visibility: visible !important;
          opacity: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 4px !important;
        }
        
        /* Style pour le jour de la semaine */
        .day-name {
          font-weight: bold;
          color: #3b82f6;
          font-size: 0.85rem;
        }
        
        /* Style pour le numéro du jour */
        .day-number {
          font-size: 1rem;
          font-weight: 600;
        }
        
        /* Style pour aujourd'hui */
        .fc-day-today .fc-col-header-cell-cushion .day-name,
        .fc-day-today .fc-col-header-cell-cushion .day-number {
          color: #2563eb;
          font-weight: 700;
        }
      `;
      
      document.head.appendChild(styleElement);
    }
      // Vérifier si nous sommes en vue Jour (timeGridDay)
    const isInDayView = document.querySelector('.fc-timeGridDay-view') !== null;
    
    // Parcourir les en-têtes et ajouter le nom du jour
    dayHeaders.forEach((header) => {
      const dateAttr = header.getAttribute('data-date');
      
      // Si l'attribut data-date existe, utiliser cette date
      if (dateAttr) {
        const date = new Date(dateAttr);
        const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
        const dayOfMonth = date.getDate(); // Jour du mois (1-31)
        
        // Sélectionner la cellule d'en-tête où nous allons afficher le texte
        const headerContent = header.querySelector('.fc-col-header-cell-cushion');
        
        if (headerContent) {
          // Vider le contenu existant
          headerContent.innerHTML = '';
          
          // Dans la vue jour, afficher uniquement le nom du jour pour éviter la redondance
          if (isInDayView) {
            // Créer un élément pour le nom du jour seulement
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'day-name';
            dayNameEl.textContent = dayNames[dayOfWeek];
            headerContent.appendChild(dayNameEl);
          } else {
            // Pour les autres vues, afficher le nom du jour et le numéro
            // Créer un élément pour le nom du jour
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'day-name';
            dayNameEl.textContent = dayNames[dayOfWeek];
            
            // Créer un élément pour le numéro du jour
            const dayNumberEl = document.createElement('div');
            dayNumberEl.className = 'day-number';
            dayNumberEl.textContent = dayOfMonth.toString();
            
            // Ajouter les éléments à l'en-tête
            headerContent.appendChild(dayNameEl);
            headerContent.appendChild(dayNumberEl);
          }
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des jours dans les en-têtes:', error);
  }
}
