// Utilitaire pour obtenir le titre de la page selon la route
export function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/profile')) return 'Mon profil';
  if (pathname.startsWith('/appointments')) return 'Mes rendez-vous';
  if (pathname.startsWith('/services')) return 'Services';
  if (pathname.startsWith('/categories')) return 'Catégories';
  if (pathname.startsWith('/calendar')) return 'Calendrier';
  if (pathname.startsWith('/dashboard')) return 'Tableau de bord';
  if (pathname === '/' || pathname.startsWith('/home')) return 'Accueil';
  return 'ServiceBooking';
}
