/**
 * Fonction qui supprime complètement la colonne d'axe dans l'en-tête du calendrier
 * pour optimiser l'espace et permettre aux jours d'utiliser toute la largeur disponible
 */
export function hideAxisHeader(): void {
  try {
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    requestAnimationFrame(() => {
      // Cibler la colonne d'axe dans l'en-tête
      const axisHeaders = document.querySelectorAll('th.fc-timegrid-axis');
      
      // Masquer chaque colonne d'axe trouvée
      axisHeaders.forEach(header => {
        if (header instanceof HTMLElement) {
          // Masquer complètement l'élément
          header.style.display = 'none';
          header.style.width = '0';
          header.style.padding = '0';
          header.style.margin = '0';
          header.style.border = 'none';
          header.style.visibility = 'hidden';
          
          // Ajouter un attribut personnalisé pour identifier l'élément modifié
          header.setAttribute('data-hidden-by-script', 'true');
        }
      });
      
      // Corriger la largeur des autres cellules d'en-tête pour qu'elles utilisent tout l'espace
      const dayHeaders = document.querySelectorAll('.fc-col-header-cell:not(.fc-timegrid-axis)');
      const totalWidth = document.querySelector('.fc-col-header')?.clientWidth || 0;
      
      if (dayHeaders.length > 0 && totalWidth > 0) {
        const cellWidth = `${totalWidth / dayHeaders.length}px`;
        dayHeaders.forEach(header => {
          if (header instanceof HTMLElement) {
            header.style.width = cellWidth;
            header.style.minWidth = cellWidth;
          }
        });
      }
      
      // Corriger le tableau parent pour qu'il commence bien au bord gauche
      const headerTable = document.querySelector('.fc-col-header table');
      if (headerTable instanceof HTMLElement) {
        headerTable.style.marginLeft = '0';
        headerTable.style.paddingLeft = '0';
        headerTable.style.width = '100%';
      }
      
      // Assurer que le conteneur de défilement commence au bord gauche
      const scrollers = document.querySelectorAll('.fc-scroller');
      scrollers.forEach(scroller => {
        if (scroller instanceof HTMLElement) {
          scroller.style.marginLeft = '0';
          scroller.style.paddingLeft = '0';
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la colonne d\'axe:', error);
  }
}
