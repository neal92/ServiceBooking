import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 min-h-0"> {/* Added min-h-0 to prevent overflow */}
        {/* Sidebar for mobile with overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div className="fixed inset-0 bg-gray-600 dark:bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col w-full max-w-xs shadow-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fermer la navigation</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                <Sidebar mobile={true} closeSidebar={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <Sidebar mobile={false} closeSidebar={() => {}} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
          <Header openSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 relative overflow-y-auto focus:outline-none dark:bg-gray-900">
            <div className="py-6">
              <div className="px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
          {/* Footer - moved inside the main content area */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;