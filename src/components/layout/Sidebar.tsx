import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, List, Tag, LayoutDashboard, X } from 'lucide-react';

interface SidebarProps {
  mobile: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ mobile, closeSidebar }: SidebarProps) => {
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Mes Rendez-vous', href: '/appointments', icon: List },
    { name: 'Calendrier', href: '/calendar', icon: Calendar },
    { name: 'Prestations', href: '/services', icon: List },
    { name: 'Catégories', href: '/categories', icon: Tag },
  ];

  return (
    <>
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
      <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1 bg-white">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={mobile ? closeSidebar : undefined}
            >
              <item.icon
                className="mr-3 flex-shrink-0 h-6 w-6 text-blue-500"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;