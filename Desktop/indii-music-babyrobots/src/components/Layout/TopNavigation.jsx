import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar, Badge } from '../UI';
import { clsx } from 'clsx';

const TopNavigation = ({ onMenuClick, currentUser }) => {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 surface border-b border-border backdrop-blur-md">
      {/* Mobile menu button */}
      <button
        className="px-4 border-r border-border text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus-ring lg:hidden transition-smooth"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Main navigation content */}
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Left side - Search */}
        <div className="flex-1 flex max-w-md">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="search-field"
                className="input pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                placeholder="Search music, artists, or tools..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        {/* Right side items */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus-ring rounded-lg transition-smooth">
              <span className="sr-only">View notifications</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-8-3h2v3H7v-3zm0-7h2v5H7V7zm8 0h2v5h-2V7z" />
              </svg>
              {/* Notification badge */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-900"></span>
            </button>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring transition-smooth">
              <Avatar 
                size="sm"
                fallback={currentUser ? currentUser.charAt(0).toUpperCase() : 'G'}
                className="ring-2 ring-white dark:ring-gray-900"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {currentUser || 'Guest User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Artist
                </div>
              </div>
              <svg className="hidden md:block h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
