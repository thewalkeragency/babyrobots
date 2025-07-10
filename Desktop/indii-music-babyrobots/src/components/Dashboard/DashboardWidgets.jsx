import React, { useState, useEffect } from 'react';

// Royalty Widget Component
export const RoyaltyWidget = ({ userId }) => {
  const [royaltyData, setRoyaltyData] = useState({
    totalEarnings: 2456.78,
    monthlyChange: 12.5,
    topTrack: 'Summer Nights',
    lastPayout: '2024-01-15'
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Royalty Overview</h3>
        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Earnings</span>
          <span className="text-lg font-bold text-gray-900">${royaltyData.totalEarnings}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Monthly Change</span>
          <span className="text-sm font-medium text-green-600">+{royaltyData.monthlyChange}%</span>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{royaltyData.topTrack}</strong> is your top earning track this month
          </p>
        </div>

        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">
          View Detailed Report
        </button>
      </div>
    </div>
  );
};

// Recent Activity Widget Component
export const RecentActivityWidget = ({ userId }) => {
  const [activities, setActivities] = useState([
    { id: 1, type: 'track_upload', message: 'New track "Midnight Blues" uploaded', time: '2 hours ago', icon: 'music' },
    { id: 2, type: 'royalty_payout', message: 'Royalty payout of $156.34 processed', time: '1 day ago', icon: 'money' },
    { id: 3, type: 'collaboration_request', message: 'New collaboration request from Sarah M.', time: '2 days ago', icon: 'users' },
    { id: 4, type: 'art_creation', message: 'Album cover for "Summer Vibes" completed', time: '3 days ago', icon: 'image' },
    { id: 5, type: 'sync_license', message: 'Sync license request for "Ocean Waves"', time: '5 days ago', icon: 'document' },
  ]);

  const getActivityIcon = (type) => {
    const iconClasses = "h-5 w-5";
    switch (type) {
      case 'music':
        return (
          <svg className={`${iconClasses} text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'money':
        return (
          <svg className={`${iconClasses} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'users':
        return (
          <svg className={`${iconClasses} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'image':
        return (
          <svg className={`${iconClasses} text-pink-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClasses} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 mt-0.5">
              {getActivityIcon(activity.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions Panel Component
export const QuickActionsPanel = ({ userRole, userId }) => {
  const getQuickActions = () => {
    const baseActions = [
      { id: 'messages', name: 'Messages', icon: 'chat', color: 'blue' },
      { id: 'settings', name: 'Settings', icon: 'cog', color: 'gray' },
    ];

    switch (userRole) {
      case 'artist':
        return [
          { id: 'upload', name: 'Upload Track', icon: 'upload', color: 'purple' },
          { id: 'create-art', name: 'Create Artwork', icon: 'palette', color: 'pink' },
          { id: 'new-release', name: 'New Release', icon: 'music', color: 'indigo' },
          ...baseActions,
        ];
      case 'fan':
        return [
          { id: 'discover', name: 'Discover Music', icon: 'search', color: 'green' },
          { id: 'playlist', name: 'Create Playlist', icon: 'list', color: 'blue' },
          ...baseActions,
        ];
      case 'licensor':
        return [
          { id: 'browse-catalog', name: 'Browse Catalog', icon: 'library', color: 'yellow' },
          { id: 'request-license', name: 'Request License', icon: 'document', color: 'orange' },
          ...baseActions,
        ];
      case 'provider':
        return [
          { id: 'new-service', name: 'Add Service', icon: 'plus', color: 'red' },
          { id: 'manage-orders', name: 'Manage Orders', icon: 'clipboard', color: 'blue' },
          ...baseActions,
        ];
      default:
        return baseActions;
    }
  };

  const actions = getQuickActions();

  const getActionIcon = (iconType) => {
    const iconClasses = "h-6 w-6";
    switch (iconType) {
      case 'upload':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'palette':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'music':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`p-4 rounded-lg border-2 border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors group`}
          >
            <div className={`text-${action.color}-600 mb-2 group-hover:text-${action.color}-700`}>
              {getActionIcon(action.icon)}
            </div>
            <span className="text-sm font-medium text-gray-900">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default { RoyaltyWidget, RecentActivityWidget, QuickActionsPanel };
