import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import VanillaTilt from 'vanilla-tilt';
import { Card, Badge, Button, Progress } from '../UI';
import ArtCreationWorkspace from '../ArtCreation/ArtCreationWorkspace';
import { ThemeToggle } from '../ui/ThemeToggle';
import { 
  WaveformDisplay, 
  AudioPlayer, 
  MasteringPanel, 
  AudioStatsWidget,
  SpectrumAnalyzer,
  AudioLevelMeter
} from '../ui/AudioComponents';
import { 
  AIAgentCard, 
  AIChatInterface, 
  AIAgentGrid,
  AIStatusPanel,
  AIQuickActions
} from '../ui/AIAgentComponents';
import {
  MusicalNoteIcon,
  FolderIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

const IndiiMusicDashboard = ({ userRole = 'artist', userId, currentUser }) => {
  const [activeWorkspace, setActiveWorkspace] = useState('tracks');
  const [activeAgent, setActiveAgent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  // Mock agents data
  const agents = [
    {
      id: 'mastering',
      name: 'Mastering Agent',
      type: 'mastering',
      icon: 'mastering',
      status: 'active',
      description: 'AI-powered audio mastering and analysis',
      specialty: 'Audio Engineering',
      lastMessage: 'Ready to master'
    },
    {
      id: 'artwork',
      name: 'Art Agent',
      type: 'artwork',
      icon: 'artwork',
      status: 'active',
      description: 'Visual content creation and branding',
      specialty: 'Creative Design',
      lastMessage: 'Generated 3 concepts'
    },
    {
      id: 'marketing',
      name: 'Marketing Agent',
      type: 'marketing',
      icon: 'marketing',
      status: 'busy',
      description: 'Campaign strategy and promotion',
      specialty: 'Digital Marketing',
      lastMessage: 'Planning campaign'
    },
    {
      id: 'royalty',
      name: 'Royalty Agent',
      type: 'royalty',
      icon: 'royalty',
      status: 'active',
      description: 'Revenue tracking and distribution',
      specialty: 'Financial Management',
      lastMessage: 'Updated earnings'
    },
    {
      id: 'distribution',
      name: 'Distribution Agent',
      type: 'distribution',
      icon: 'distribution',
      status: 'idle',
      description: 'Multi-platform release management',
      specialty: 'Platform Distribution'
    },
    {
      id: 'legal',
      name: 'Legal Assistant',
      type: 'legal',
      icon: 'legal',
      status: 'idle',
      description: 'Contract review and industry guidance',
      specialty: 'Music Law'
    }
  ];

  const workspaces = [
    { id: 'tracks', name: 'Tracks', icon: MusicalNoteIcon, badge: null },
    { id: 'mastering', name: 'Mastering', icon: SpeakerWaveIcon, badge: 'AI' },
    { id: 'art-creation', name: 'Art Studio', icon: PaintBrushIcon, badge: 'AI' },
    { id: 'projects', name: 'Projects', icon: FolderIcon, badge: null },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, badge: null },
    { id: 'royalties', name: 'Royalties', icon: CurrencyDollarIcon, badge: null },
    { id: 'distribution', name: 'Distribution', icon: GlobeAltIcon, badge: null },
  ];

  const handleSendMessage = (message) => {
    const newMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `I understand you want to ${message.toLowerCase()}. Let me help you with that.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleAgentSelect = (agent) => {
    setActiveAgent(agent);
    setChatOpen(true);
    setMessages([]);
  };

  // Initialize VanillaTilt effects
  useEffect(() => {
    const initializeTilt = () => {
      const tiltElements = document.querySelectorAll('.tilt');
      tiltElements.forEach(el => {
        VanillaTilt.init(el, {
          max: 15,
          speed: 400,
          glare: true,
          'max-glare': 0.3,
          perspective: 1000,
          scale: 1.02
        });
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeTilt, 100);
    return () => clearTimeout(timer);
  }, [activeWorkspace]); // Re-initialize when workspace changes

  const TopNavigation = () => (
    <div className="bg-studio-900 border-b border-technical-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 text-technical-400 hover:text-white hover:bg-technical-800 rounded-lg transition-colors lg:hidden"
          >
            {sidebarCollapsed ? <Bars3Icon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-electric-400 to-electric-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">i</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">indii.music</h1>
              <p className="text-technical-400 text-xs">AI-Powered Music Industry Platform</p>
            </div>
          </div>
        </div>

        {/* Center: Workspace title */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-studio-800 rounded-lg border border-technical-700">
            {React.createElement(workspaces.find(w => w.id === activeWorkspace)?.icon || MusicalNoteIcon, { 
              className: "h-4 w-4 text-electric-400" 
            })}
            <span className="text-white text-sm font-medium">
              {workspaces.find(w => w.id === activeWorkspace)?.name}
            </span>
          </div>
        </div>

{/* Theme Toggle */}
        <div className="flex items-center space-x-3">
          <ThemeToggle variant="switch" />
          <button className="relative p-2 text-technical-400 hover:text-white hover:bg-technical-800 rounded-lg transition-colors">
            <BellIcon className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-audio-warning rounded-full border-2 border-studio-900" />
          </button>
          
          <button className="flex items-center space-x-2 p-2 text-technical-400 hover:text-white hover:bg-technical-800 rounded-lg transition-colors">
            <UserCircleIcon className="h-6 w-6" />
            <span className="hidden sm:block text-sm">{currentUser}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={clsx(
      "bg-studio-900 border-r border-technical-700 flex flex-col transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Workspace Navigation */}
      <div className="p-4 space-y-2">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            className={clsx(
              "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              activeWorkspace === workspace.id
                ? "bg-electric-600/20 text-electric-400 border border-electric-500/30"
                : "text-technical-400 hover:text-white hover:bg-technical-800"
            )}
          >
            <workspace.icon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="text-sm font-medium">{workspace.name}</span>
                {workspace.badge && (
                  <Badge variant="primary" size="sm">{workspace.badge}</Badge>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* AI Agents Section */}
      {!sidebarCollapsed && (
        <div className="flex-1 p-4">
          <h3 className="text-technical-400 text-xs font-semibold uppercase tracking-wider mb-3">
            AI Agents
          </h3>
          <AIAgentGrid 
            agents={agents} 
            activeAgent={activeAgent} 
            onAgentSelect={handleAgentSelect}
          />
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-technical-700">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-technical-400 hover:text-white hover:bg-technical-800 rounded-lg transition-colors">
          <Cog6ToothIcon className="h-5 w-5" />
          {!sidebarCollapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </div>
  );

  const renderWorkspaceContent = () => {
    switch (activeWorkspace) {
      case 'tracks':
        return (
          <div className="space-y-6">
            {/* Header with quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-studio-800 border-technical-700 p-4 tilt">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-electric-400 to-electric-600 rounded-lg flex items-center justify-center">
                    <MusicalNoteIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">12</div>
                    <div className="text-sm text-technical-400">Total Tracks</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-studio-800 border-technical-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-audio-levels to-emerald-600 rounded-lg flex items-center justify-center">
                    <SpeakerWaveIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">8</div>
                    <div className="text-sm text-technical-400">Mastered</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-studio-800 border-technical-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-audio-warning to-yellow-600 rounded-lg flex items-center justify-center">
                    <MicrophoneIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">3</div>
                    <div className="text-sm text-technical-400">In Queue</div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-studio-800 border-technical-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">5</div>
                    <div className="text-sm text-technical-400">Released</div>
                  </div>
                </div>
              </Card>
            </div>

      {/* Main content grid with tilt interaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tilt" style={{ perspective: '1000px' }}>
        {/* Recent tracks with animated hover */}
              <Card className="bg-studio-800 border-technical-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Tracks</h3>
                <div className="space-y-4">
                  <AudioPlayer compact track={{ title: "Summer Vibes", artist: "Demo Artist" }} />
                  <AudioPlayer compact track={{ title: "Midnight Drive", artist: "Demo Artist" }} />
                  <AudioPlayer compact track={{ title: "Electric Dreams", artist: "Demo Artist" }} />
                </div>
              </Card>

              {/* Quick actions */}
              <Card className="bg-studio-800 border-technical-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <AIQuickActions onAction={(action) => console.log('Action:', action)} />
              </Card>
            </div>
          </div>
        );

      case 'mastering':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <AudioPlayer showWaveform track={{ title: "Summer Vibes", artist: "Demo Artist" }} />
                <MasteringPanel />
              </div>
              <div className="space-y-6">
                <AudioStatsWidget />
                <Card className="bg-studio-800 border-technical-700 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Mastering Queue</h3>
                  <div className="space-y-3">
                    {['Track 1.wav', 'Track 2.wav', 'Track 3.wav'].map((track, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-studio-900 rounded-lg">
                        <span className="text-white">{track}</span>
                        <Badge variant="warning" size="sm">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-studio-800 border-technical-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Streams</h3>
                <div className="text-3xl font-bold text-electric-400 mb-2">24.8K</div>
                <p className="text-sm text-technical-400">Total plays this month</p>
                <div className="mt-4">
                  <Progress value={75} variant="primary" showLabel />
                </div>
              </Card>
              
              <Card className="bg-studio-800 border-technical-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue</h3>
                <div className="text-3xl font-bold text-audio-levels mb-2">$1,247</div>
                <p className="text-sm text-technical-400">Earnings this quarter</p>
                <div className="mt-4">
                  <Progress value={60} variant="success" showLabel />
                </div>
              </Card>
              
              <Card className="bg-studio-800 border-technical-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement</h3>
                <div className="text-3xl font-bold text-audio-warning mb-2">3.2K</div>
                <p className="text-sm text-technical-400">New followers</p>
                <div className="mt-4">
                  <Progress value={45} variant="warning" showLabel />
                </div>
              </Card>
            </div>
            
            <Card className="bg-studio-800 border-technical-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Analytics</h3>
              <SpectrumAnalyzer height={120} className="w-full" />
            </Card>
          </div>
        );

      case 'art-creation':
        return (
          <div className="h-full">
            <ArtCreationWorkspace 
              projectId="demo-project" 
              trackMetadata={{
                title: "Summer Vibes",
                genre: "Electronic",
                mood: "Uplifting"
              }}
            />
          </div>
        );

      case 'royalties':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Spotify', amount: '$456.78', change: '+12%' },
                { label: 'Apple Music', amount: '$321.45', change: '+8%' },
                { label: 'YouTube', amount: '$189.23', change: '+15%' },
                { label: 'Other DSPs', amount: '$279.87', change: '+5%' }
              ].map((platform, i) => (
                <Card key={i} className="bg-studio-800 border-technical-700 p-4">
                  <div className="text-technical-400 text-sm mb-1">{platform.label}</div>
                  <div className="text-xl font-bold text-white mb-1">{platform.amount}</div>
                  <div className="text-audio-levels text-xs">{platform.change}</div>
                </Card>
              ))}
            </div>
            
            <Card className="bg-studio-800 border-technical-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                {[
                  { source: 'Streaming', amount: 456.78, percentage: 65 },
                  { source: 'Sync Licensing', amount: 189.50, percentage: 27 },
                  { source: 'Merchandise', amount: 56.30, percentage: 8 }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-technical-400">{item.source}</span>
                      <span className="text-white font-mono">${item.amount}</span>
                    </div>
                    <Progress value={item.percentage} variant="primary" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-technical-400 text-lg">Select a workspace to get started</div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-studio-900 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderWorkspaceContent()}
            </div>
          </div>
          
          {/* AI Chat Panel */}
          {chatOpen && (
            <div className="w-80 border-l border-technical-700 bg-studio-900">
              <div className="p-4 border-b border-technical-700 flex items-center justify-between">
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-technical-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                {activeAgent ? (
                  <AIChatInterface 
                    agent={activeAgent}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    className="h-96"
                  />
                ) : (
                  <div className="space-y-4">
                    <AIStatusPanel />
                    <div className="text-center py-8">
                      <div className="text-technical-400 text-sm">
                        Select an AI agent to start chatting
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndiiMusicDashboard;
