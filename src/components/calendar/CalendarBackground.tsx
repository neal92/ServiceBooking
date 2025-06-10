import React from 'react';

// Composant pour ajouter un fond stylisé au calendrier
const CalendarBackground: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 opacity-10 dark:opacity-5"
      style={{
        backgroundImage: `
          radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.15) 2px, transparent 0),
          radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.1) 2px, transparent 0)
        `,
        backgroundSize: '100px 100px',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 100%)',
      }}
    />
  );
};

export default CalendarBackground;
