import React, { useState } from 'react';
import ArtCreationWidget from './ArtCreationWidget';
import { RoyaltyWidget, RecentActivityWidget, QuickActionsPanel } from './DashboardWidgets';
import { Card, Badge, Button, Container, Grid } from '../UI';
import TiltCard from '../UI/TiltCard';
import { clsx } from 'clsx';

const EnhancedDashboard = ({ userRole = 'artist', userId }) => {
  const [activeProject, setActiveProject] = useState(null);

  const getDashboardConfig = () => {
    const baseWidgets = [
      { id: 'quick-actions', component: QuickActionsPanel, size: 'medium' },
      { id: 'recent-activity', component: RecentActivityWidget, size: 'large' },
    ];

    switch (userRole) {
      case 'artist':
        return [
          { id: 'art-creation', component: ArtCreationWidget, size: 'large' },
          { id: 'royalty', component: RoyaltyWidget, size: 'medium' },
          ...baseWidgets,
        ];
      case 'fan':
        return [
          { id: 'discovery', component: DiscoveryWidget, size: 'large' },
          { id: 'playlists', component: PlaylistWidget, size: 'medium' },
          ...baseWidgets,
        ];
      case 'licensor':
        return [
          { id: 'sync-opportunities', component: SyncOpportunitiesWidget, size: 'large' },
          { id: 'licensing', component: LicensingWidget, size: 'medium' },
          ...baseWidgets,
        ];
      case 'provider':
        return [
          { id: 'marketplace', component: MarketplaceWidget, size: 'large' },
          { id: 'orders', component: OrdersWidget, size: 'medium' },
          ...baseWidgets,
        ];
      default:
        return baseWidgets;
    }
  };

  const widgets = getDashboardConfig();

  const getRoleGradient = (role) => {
    const gradients = {
      artist: 'gradient-role-artist',
      fan: 'gradient-role-fan', 
      licensor: 'gradient-role-licensor',
      provider: 'gradient-role-provider',
      default: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
    };
    return gradients[role] || gradients.default;
  };

  const getRoleMessages = (role) => {
    const messages = {
      artist: "Create, distribute, and monetize your music with AI-powered tools",
      fan: "Discover new music and connect with your favorite artists",
      licensor: "Find the perfect music for your projects", 
      provider: "Offer your services to the music community"
    };
    return messages[role] || "Welcome to the future of music";
  };

  return (
    <Container className="py-6">
      <div className="space-y-8 animate-fade-in">
        {/* Enhanced Welcome Header */}
        <TiltCard 
          className={clsx(
            'relative overflow-hidden rounded-2xl shadow-2xl',
            getRoleGradient(userRole)
          )}
          tiltOptions={{ max: 5, scale: 1.01, glare: true, 'max-glare': 0.2 }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative px-8 py-12 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <h1 className="text-display-lg">Welcome to Indii Music</h1>
                  <Badge variant={userRole} size="lg" className="animate-bounce-gentle">
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
                <p className="text-body-lg opacity-90 max-w-2xl">
                  {getRoleMessages(userRole)}
                </p>
              </div>
              <div className="hidden lg:block animate-float">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Enhanced Dashboard Grid */}
        <div className="space-y-2">
          <h2 className="text-display-xs text-gray-900 dark:text-gray-100">Your Dashboard</h2>
          <Grid cols={3} gap={6}>
            {widgets.map((widget, index) => {
              const Widget = widget.component;
              const gridSpan = widget.size === 'large' ? 'lg:col-span-2' : 'lg:col-span-1';
              
              return (
                <div 
                  key={widget.id} 
                  className={clsx(
                    gridSpan,
                    'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Widget 
                    userRole={userRole}
                    userId={userId}
                    activeProject={activeProject}
                    onProjectChange={setActiveProject}
                  />
                </div>
              );
            })}
          </Grid>
        </div>

        {/* Enhanced Feature Spotlight */}
        {userRole === 'artist' && (
          <TiltCard 
            className="animate-slide-up"
            style={{ animationDelay: '400ms' }}
            tiltOptions={{ max: 3, scale: 1.01 }}
          >
            <Card elevated className="overflow-hidden border-l-4 border-artist">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-artist/10 rounded-xl">
                        <svg className="h-8 w-8 text-artist" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          New: AI-Powered Artwork Creation
                        </h3>
                        <Badge variant="primary" size="sm">Beta</Badge>
                      </div>
                      <p className="text-body-sm text-gray-600 dark:text-gray-400">
                        Create stunning album covers and marketing materials in minutes with our AI tools.
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="primary" className="shadow-lg hover:shadow-xl">
                      Try Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TiltCard>
        )}
      </div>
    </Container>
  );
};

// Enhanced placeholder widgets with new components
const DiscoveryWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-fan/10 rounded-lg">
            <svg className="h-6 w-6 text-fan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 6-12 6z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Music Discovery</h3>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Discover new music based on your preferences...</p>
        <Button variant="outline" size="sm" className="w-full">Explore Music</Button>
      </div>
    </Card>
  </TiltCard>
);

const PlaylistWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-fan/10 rounded-lg">
            <svg className="h-6 w-6 text-fan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Playlists</h3>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Manage your music collections...</p>
        <Button variant="outline" size="sm" className="w-full">View Playlists</Button>
      </div>
    </Card>
  </TiltCard>
);

const SyncOpportunitiesWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-licensor/10 rounded-lg">
              <svg className="h-6 w-6 text-licensor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sync Opportunities</h3>
          </div>
          <Badge variant="warning" size="sm">3 New</Badge>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Browse available sync licensing opportunities...</p>
        <Button variant="outline" size="sm" className="w-full">Browse Opportunities</Button>
      </div>
    </Card>
  </TiltCard>
);

const LicensingWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-licensor/10 rounded-lg">
            <svg className="h-6 w-6 text-licensor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Licenses</h3>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Track your licensing agreements...</p>
        <Button variant="outline" size="sm" className="w-full">Manage Licenses</Button>
      </div>
    </Card>
  </TiltCard>
);

const MarketplaceWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-provider/10 rounded-lg">
              <svg className="h-6 w-6 text-provider" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a4 4 0 008 0v-6M8 11h8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Marketplace</h3>
          </div>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Manage your service offerings...</p>
        <Button variant="outline" size="sm" className="w-full">View Services</Button>
      </div>
    </Card>
  </TiltCard>
);

const OrdersWidget = () => (
  <TiltCard tiltOptions={{ max: 8, scale: 1.02 }}>
    <Card elevated className="p-6 h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-provider/10 rounded-lg">
              <svg className="h-6 w-6 text-provider" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Orders</h3>
          </div>
          <Badge variant="primary" size="sm">5 Active</Badge>
        </div>
        <p className="text-body text-gray-600 dark:text-gray-400">Track your current projects...</p>
        <Button variant="outline" size="sm" className="w-full">View Orders</Button>
      </div>
    </Card>
  </TiltCard>
);

export default EnhancedDashboard;
