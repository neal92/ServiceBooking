// Fichier temporaire pour tester les modifications
import React from 'react';
import AppointmentList from '../components/appointments/AppointmentList';

const FilterExample = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
        <div className="space-y-3">
          {/* Filtre par statut */}
          <div className="inline-flex shadow-sm rounded-md">
            {/* Boutons de filtre par statut */}
          </div>
          
          {/* Espacement supplémentaire entre les deux groupes de filtres */}
          <div className="h-6"></div>
          
          {/* Filtre par période (all, upcoming, ongoing, past) */}
          <div className="inline-flex shadow-sm rounded-md">
            {/* Boutons de filtre par période */}
          </div>
        </div>
        
        <button className="button">
          Nouveau rendez-vous
        </button>
      </div>
    </div>
  );
};

export default FilterExample;
