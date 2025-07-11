import * as React from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Tag, LayoutDashboard, X, User, Settings, LogOut, ClipboardList, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFullMediaUrl } from '../../utils/config';

interface SidebarProps {
  mobile: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ mobile, closeSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Navigation pour les administrateurs
  const adminNavigation = [
    { name: 'Tableau de bord', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Mes Rendez-vous', href: '/app/appointments', icon: ClipboardList },
    { name: 'Calendrier', href: '/app/calendar', icon: Calendar },
    { name: 'Prestations', href: '/app/services', icon: FileText },
    { name: 'Catégories', href: '/app/categories', icon: Tag },
  ];

  // Navigation pour les utilisateurs ordinaires
  const userNavigation = [
    { name: 'Accueil', href: '/app/home', icon: LayoutDashboard },
    { name: 'Mes Rendez-vous', href: '/app/appointments', icon: ClipboardList },
    { name: 'Calendrier', href: '/app/calendar', icon: Calendar },
  ];

  // Sélection des éléments de navigation en fonction du rôle de l'utilisateur
  const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center flex-shrink-0 px-4">
        {mobile && (
          <button
            type="button"
            className="ml-auto flex items-center justify-center h-10 w-10 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={closeSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-gray-500" aria-hidden="true" />
          </button>
        )}
        <div className="flex items-center">
          <ClipboardList className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-xl font-bold text-blue-600">RDV Manager</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-2 bg-white dark:bg-gray-800 mt-5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-md ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`
              }
              onClick={mobile ? closeSidebar : undefined}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User information section at the bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
        <div
          className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          {user?.avatar ? (
            <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
              <img
                src={getFullMediaUrl(user.avatar)}
                alt={`Avatar de ${user.firstName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Erreur de chargement de l\'avatar dans la sidebar:', e);
                  // Insérer le code pour afficher les initiales
                  const parentDiv = e.currentTarget.parentElement;
                  if (parentDiv) {
                    e.currentTarget.style.display = 'none';
                    parentDiv.className = "h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3";
                    parentDiv.innerHTML = `<span>${user?.firstName?.charAt(0).toUpperCase() || 'U'}</span>`;
                    // Ajouter un log pour suivre cette modification
                    console.log('Avatar remplacé par initiale dans la sidebar');
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
              {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {showUserMenu && (
          <div className="mt-3 space-y-1">
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`
              }
              onClick={mobile ? closeSidebar : undefined}
            >
              <User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Profil
            </NavLink>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Paramètres
            </a>            <button
              onClick={() => {
                logout();
                navigate('/login'); // Redirection vers la page de connexion après déconnexion
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-bold text-red-700 dark:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-600 dark:text-red-500" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;