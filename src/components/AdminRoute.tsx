import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Composant pour protéger les routes qui nécessitent un rôle d'administrateur
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Affiche rien pendant la vérification de l'authentification
  if (loading) {
    return <div className="loading">Chargement...</div>;
  }
    // Redirige vers la page d'accueil ou la page utilisateur si l'utilisateur n'est pas connecté ou n'est pas admin
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/app/home" replace />;
  }
  
  // Si l'utilisateur est un administrateur, affiche le contenu protégé
  return <>{children}</>;
};

export default AdminRoute;
