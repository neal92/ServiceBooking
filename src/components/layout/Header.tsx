import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { getFullMediaUrl } from '../../utils/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  openSidebar: () => void;
}

const Header = ({ openSidebar }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to check initial theme preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
        onClick={openSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">RDV Manager</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          {/* Theme toggle button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="bg-white dark:bg-gray-700 p-1.5 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Notification button */}
          <button
            type="button"
            className="bg-white dark:bg-gray-700 p-1.5 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`p-0.5 rounded-full ${!user?.avatar ? 'bg-white dark:bg-gray-700 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="sr-only">Open user menu</span>
              {user?.avatar ? (
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src={getFullMediaUrl(user.avatar)}
                    alt={`Avatar de ${user.firstName}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'avatar dans le header:', e);
                      e.currentTarget.style.display = 'none';
                      // Remplacer par un élément avec l'initiale
                      const parentDiv = e.currentTarget.parentElement;
                      if (parentDiv) {
                        parentDiv.className = "h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white";
                        parentDiv.innerHTML = `<span>${user.firstName?.charAt(0).toUpperCase() || 'U'}</span>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <span>{user?.firstName?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              )}
            </button>

            {/* Menu déroulant */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Mon Profil
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4 text-red-600 dark:text-red-500" />
                    Déconnexion
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;