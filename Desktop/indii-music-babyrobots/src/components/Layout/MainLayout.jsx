import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { ThemeProvider } from '../../context/ThemeContext';

const MainLayout = ({ children, currentUser = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar currentUser={currentUser} />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-gray-600/75 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full surface animate-slide-up">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus-ring bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-smooth"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar currentUser={currentUser} />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <TopNavigation 
            onMenuClick={() => setSidebarOpen(true)} 
            currentUser={currentUser}
          />
          
          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none scrollbar-custom">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
