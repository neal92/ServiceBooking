export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatAppointmentTime = (dateString: string, duration: number): string => {
  const date = new Date(dateString);
  const startTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const endDate = new Date(date.getTime() + duration * 60000);
  const endTime = endDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${startTime} - ${endTime}`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'À venir':
      return {
        bgColor: 'bg-green-500',
        lightBgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    case 'En cours':
      return {
        bgColor: 'bg-blue-500',
        lightBgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      };
    case 'Terminé':
      return {
        bgColor: 'bg-gray-500',
        lightBgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      };
    default:
      return {
        bgColor: 'bg-gray-500',
        lightBgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      };
  }
};