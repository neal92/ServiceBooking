import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, List, Tag, LayoutDashboard, X, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  mobile: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ mobile, closeSidebar }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Mes Rendez-vous', href: '/appointments', icon: List },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Prestations', href: '/services', icon: List },
    { name: 'Catégories', href: '/categories', icon: Tag },
  ];

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
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-xl font-bold text-blue-600">RDV Manager</h1>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1 bg-white dark:bg-gray-800 mt-5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
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
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'email@exemple.com'}</p>
          </div>
        </div>
        
        {showUserMenu && (
          <div className="mt-3 space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Profil
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Paramètres
            </a>
            <button 
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;