import React from 'react';
import {
  HomeIcon,
  UserCircleIcon,
  MusicalNoteIcon as MusicNoteIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ currentUser }) => {
  const menuItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Tracks', href: '/tracks', icon: MusicNoteIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  return (
    <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
      <div className="flex items-center h-16 px-4 text-lg font-semibold text-gray-900">
        Welcome, {currentUser || 'Guest'}
      </div>
      <div className="flex-1 overflow-y-auto mt-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
