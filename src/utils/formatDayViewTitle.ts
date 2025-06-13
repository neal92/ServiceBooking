/**
 * Fonction utilitaire qui formate correctement le titre de la vue jour
 * pour avoir un affichage plus élégant en français
 * 
 * @param date La date à formater (peut être un objet Date standard ou un objet ExpandedZonedMarker de FullCalendar)
 * @returns Le titre formaté
 */
export const formatDayViewTitle = (date: any): string => {
  try {
    // Vérifier si la date est valide
    if (!date) {
      console.error('Date invalide passée à formatDayViewTitle');
      return '';
    }
    
    // Adapter pour fonctionner avec Date ou avec l'objet date de FullCalendar
    let day, month, year;
    
    // Si c'est un objet Date standard
    if (date instanceof Date) {
      day = date.getDate();
      month = date.getMonth();
      year = date.getFullYear();
    } 
    // Si c'est un objet ExpandedZonedMarker de FullCalendar
    else if (typeof date === 'object') {
      // Vérifier si ce sont les propriétés de FullCalendar
      if ('marker' in date) {
        const marker = date.marker;
        if (marker instanceof Date) {
          day = marker.getDate();
          month = marker.getMonth();
          year = marker.getFullYear();
        } else {
          // Si marker n'est pas un Date, essayer d'autres approches
          day = date.date || 1;
          month = date.month - 1 || 0; // FullCalendar utilise 1-12 pour les mois, JS utilise 0-11
          year = date.year || new Date().getFullYear();
        }
      } 
      // Si ce n'est pas un format connu, essayer d'accéder aux propriétés directement
      else {
        day = date.date || date.day || date.getDate?.() || 1;
        month = (date.month !== undefined ? date.month - 1 : date.getMonth?.()) || 0;
        year = date.year || date.getFullYear?.() || new Date().getFullYear();
      }
    } else {
      // Fallback en cas de format inconnu
      const fallbackDate = new Date();
      day = fallbackDate.getDate();
      month = fallbackDate.getMonth();
      year = fallbackDate.getFullYear();
      console.warn('Format de date non reconnu dans formatDayViewTitle, utilisation de la date actuelle');
    }
    
    // Formater le mois en français
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const monthName = months[month];
    
    // Formater selon le modèle français: "11 juin 2025"
    return `${day} ${monthName} ${year}`;
  } catch (error) {
    console.error('Erreur lors du formatage du titre:', error);
    return '';
  }
};
