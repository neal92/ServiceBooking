import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Redirige l'utilisateur vers la page appropriée en fonction de son rôle
 * - Admin -> Dashboard
 * - User -> UserHome
 */
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Navigate to="/app/home" replace />;
};

export default RoleBasedRedirect;
