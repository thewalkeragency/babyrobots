import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import VanillaTilt from 'vanilla-tilt';
import { Card, Badge, Button, Progress, Select } from '../ui';
import ArtCreationWorkspace from '../ArtCreation/ArtCreationWorkspace';
import ProjectWorkspaceUI from '../ProjectWorkspaceUI';
import { ThemeToggle } from '../ui/ThemeToggle';
import FrankenUIDemo from '../FrankenUIDemo';
import { 
  WaveformDisplay, 
  AudioPlayer, 
  MasteringPanel, 
  AudioStatsWidget,
  SpectrumAnalyzer,
  AudioLevelMeter
} from '../ui/AudioComponents';
import { RoyaltyWidget, RecentActivityWidget } from './DashboardWidgets';
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
  SpeakerWaveIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const IndiiMusicDashboard = ({ userRole = 'artist', userId, currentUser, onRoleChange }) => {
  const [activeWorkspace, setActiveWorkspace] = useState('tracks');
  const [activeAgent, setActiveAgent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);

  useEffect(() => {
    if (!chatSessionId) {
      setChatSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [chatSessionId]);

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
    { id: 'franken-ui-demo', name: 'Franken UI', icon: CodeBracketIcon, badge: 'Demo' },
  ];

  useEffect(() => {
    if (!chatSessionId) {
      setChatSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [chatSessionId]);

  const handleAgentSelect = (agent) => {
    setActiveAgent(agent);
    setChatOpen(true);
    setMessages([]); // Clear messages when switching agents/starting new chat
  };

  const handleSendMessage = async (message) => {
    // For now, just log the message. In a real app, this would send to an API.
    console.log('Sending message:', message);
    setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user' }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, { text: `AI response to: ${message}`, sender: 'ai' }]);
    }, 1000);
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
    <div className="uk-navbar-container uk-theme-zinc dark" uk-navbar="true">
      <div className="uk-navbar-left">
        <Button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          variant="text" className="uk-hidden@m"
          uk-icon="menu"
        >
        </Button>
        
        <div className="uk-flex uk-flex-middle uk-margin-small-left">
          <div className="uk-border-circle uk-background-primary uk-flex uk-flex-center uk-flex-middle" style={{width: '32px', height: '32px'}}>
            <span className="uk-text-white uk-text-bold uk-text-small">i</span>
          </div>
          <div className="uk-margin-small-left">
            <h1 className="uk-text-white uk-margin-remove uk-text-lead">indii.music</h1>
            <p className="uk-text-muted uk-margin-remove uk-text-small">AI-Powered Music Industry Platform</p>
          </div>
        </div>
      </div>

      <div className="uk-navbar-center uk-visible@m">
        <Card className="uk-card-small uk-padding-small uk-flex uk-flex-middle">
          {React.createElement(workspaces.find(w => w.id === activeWorkspace)?.icon || MusicalNoteIcon, { 
            className: "uk-icon uk-margin-small-right", 
            style: {width: '16px', height: '16px', color: '#00d4aa'}
          })}
          <span className="uk-text-white uk-text-small uk-text-bold">
            {workspaces.find(w => w.id === activeWorkspace)?.name}
          </span>
        </Card>
      </div>

      <div className="uk-navbar-right">
        <div className="uk-flex uk-flex-middle uk-child-width-auto uk-grid-small" uk-grid="true">
          <div><ThemeToggle variant="switch" /></div>
          <div>
            <Button variant="text" className="uk-position-relative" uk-icon="bell">
              <span className="uk-badge uk-position-top-right uk-position-small" style={{backgroundColor: '#ff6b6b'}}></span>
            </Button>
          </div>
          <div>
            <Select
              value={userRole}
              onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
              className="uk-form-small uk-form-width-small"
            >
              <option value="artist">Artist</option>
              <option value="fan">Fan</option>
              <option value="licensor">Licensor</option>
              <option value="serviceProvider">Service Provider</option>
            </Select>
          </div>
          <div>
            <Button variant="text" className="uk-flex uk-flex-middle">
              <UserCircleIcon className="uk-margin-small-right" style={{width: '24px', height: '24px', color: '#9ca3af'}} />
              <span className="uk-text-small uk-visible@s">{currentUser}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <Card className={clsx(
      "uk-height-viewport uk-flex uk-flex-column uk-position-fixed uk-position-z-index uk-background-default uk-width-medium uk-animation-slide-left-small",
      sidebarCollapsed ? "uk-width-small@m" : "uk-width-medium@m",
      sidebarCollapsed && "uk-hidden@m",
      !sidebarCollapsed && "uk-visible@s"
    )}>
      {/* Workspace Navigation */}
      <div className="uk-padding uk-flex-1">
        <nav className="uk-nav uk-nav-default">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className={activeWorkspace === workspace.id ? "uk-active" : ""}>
              <Button
                onClick={() => setActiveWorkspace(workspace.id)}
                className={clsx(
                  "uk-width-1-1 uk-text-left uk-flex uk-flex-middle",
                  activeWorkspace === workspace.id
                    ? "uk-background-primary uk-light"
                    : "uk-text-muted"
                )}
                variant="text"
              >
                <workspace.icon 
                  className="uk-margin-small-right" 
                  style={{width: '20px', height: '20px'}} 
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="uk-text-small uk-text-bold uk-margin-small-right">{workspace.name}</span>
                    {workspace.badge && (
                      <span className="uk-badge uk-badge-primary uk-margin-auto-left">{workspace.badge}</span>
                    )}
                  </>
                )}
              </Button>
            </li>
          ))}
        </nav>
      </div>

      {/* AI Agents Section */}
      {!sidebarCollapsed && (
        <div className="uk-padding uk-flex-1">
          <h3 className="uk-text-muted uk-text-small uk-text-uppercase uk-text-bold uk-margin-small-bottom">
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
      <div className="uk-padding uk-border-top">
        <Button variant="text" className="uk-width-1-1 uk-text-left uk-flex uk-flex-middle uk-text-muted">
          <Cog6ToothIcon className="uk-margin-small-right" style={{width: '20px', height: '20px'}} />
          {!sidebarCollapsed && <span className="uk-text-small">Settings</span>}
        </Button>
      </div>
    </Card>
  );

  const renderWorkspaceContent = () => {
    switch (activeWorkspace) {
      case 'tracks':
        return (
          <div className="uk-margin-large-bottom">
            {/* Header with quick stats */}
            <div className="uk-grid-match uk-child-width-1-4@m uk-grid-small" uk-grid="true">
              <div>
                <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
                  <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                    <div>
                      <div className="uk-border-circle uk-background-primary uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px'}}>
                        <MusicalNoteIcon style={{width: '20px', height: '20px', color: 'white'}} />
                      </div>
                    </div>
                    <div className="uk-width-expand">
                      <div className="uk-text-large uk-text-bold uk-text-white">12</div>
                      <div className="uk-text-small uk-text-muted">Total Tracks</div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
                  <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                    <div>
                      <div className="uk-border-circle uk-background-secondary uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px'}}>
                        <SpeakerWaveIcon style={{width: '20px', height: '20px', color: 'white'}} />
                      </div>
                    </div>
                    <div className="uk-width-expand">
                      <div className="uk-text-large uk-text-bold uk-text-white">8</div>
                      <div className="uk-text-small uk-text-muted">Mastered</div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
                  <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                    <div>
                      <div className="uk-border-circle uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px', backgroundColor: '#f0ad4e'}}>
                        <MicrophoneIcon style={{width: '20px', height: '20px', color: 'white'}} />
                      </div>
                    </div>
                    <div className="uk-width-expand">
                      <div className="uk-text-large uk-text-bold uk-text-white">3</div>
                      <div className="uk-text-small uk-text-muted">In Queue</div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
                  <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                    <div>
                      <div className="uk-border-circle uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px', backgroundColor: '#8b5cf6'}}>
                        <GlobeAltIcon style={{width: '20px', height: '20px', color: 'white'}} />
                      </div>
                    </div>
                    <div className="uk-width-expand">
                      <div className="uk-text-large uk-text-bold uk-text-white">5</div>
                      <div className="uk-text-small uk-text-muted">Released</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Main content grid */}
            <div className="uk-grid-match uk-child-width-1-2@l uk-margin-large-top" uk-grid="true">
              {/* Recent tracks */}
              <div>
                <Card className="uk-card-body uk-theme-zinc dark">
                  <h3 className="uk-card-title uk-text-white">Recent Tracks</h3>
                  <div className="uk-margin-top">
                    <AudioPlayer compact track={{ title: "Summer Vibes", artist: "Demo Artist" }} />
                    <AudioPlayer compact track={{ title: "Midnight Drive", artist: "Demo Artist" }} />
                    <AudioPlayer compact track={{ title: "Electric Dreams", artist: "Demo Artist" }} />
                  </div>
                </Card>
              </div>

              {/* Quick actions */}
              <div>
                <Card className="uk-card-body uk-theme-zinc dark">
                  <h3 className="uk-card-title uk-text-white">Quick Actions</h3>
                  <div className="uk-margin-top">
                    <AIQuickActions onAction={(action) => console.log('Action:', action)} />
                  </div>
                </Card>
              </div>
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
                <Card className="uk-card-body uk-theme-zinc dark">
                  <h3 className="uk-card-title uk-text-white uk-margin-bottom">Mastering Queue</h3>
                  <div className="uk-margin-top">
                    {['Track 1.wav', 'Track 2.wav', 'Track 3.wav'].map((track, i) => (
                      <div key={i} className="uk-flex uk-flex-middle uk-flex-between uk-padding-small uk-background-muted uk-border-rounded uk-margin-small-bottom">
                        <span className="uk-text-white">{track}</span>
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
          <div className="uk-grid-small uk-child-width-1-2@m uk-margin-top" uk-grid="true">
            <div>
              <RoyaltyWidget userId={userId} />
            </div>
            <div>
              <RecentActivityWidget userId={userId} />
            </div>
          </div>
        );

      case 'art-creation':
        return (
          <div className="uk-height-1-1">
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

      case 'projects':
        return (
          <div className="uk-height-1-1">
            <ProjectWorkspaceUI 
              workspaceId={userId} // Using userId as a mock workspaceId for now
              userId={userId}
            />
          </div>
        );

      case 'royalties':
        return (
          <div className="space-y-6">
            <div className="uk-grid-small uk-child-width-1-4@m" uk-grid="true">
              {[
                { label: 'Spotify', amount: '$456.78', change: '+12%' },
                { label: 'Apple Music', amount: '$321.45', change: '+8%' },
                { label: 'YouTube', amount: '$189.23', change: '+15%' },
                { label: 'Other DSPs', amount: '$279.87', change: '+5%' }
              ].map((platform, i) => (
                <Card key={i} className="uk-card-body uk-theme-zinc dark">
                  <div className="uk-text-muted uk-text-small uk-margin-small-bottom">{platform.label}</div>
                  <div className="uk-text-xl uk-text-bold uk-text-white uk-margin-small-bottom">{platform.amount}</div>
                  <div className="uk-text-audio-levels uk-text-xs">{platform.change}</div>
                </Card>
              ))}
            </div>
            
            <Card className="uk-card-body uk-theme-zinc dark">
              <h3 className="uk-card-title uk-text-white uk-margin-bottom">Revenue Breakdown</h3>
              <div className="uk-margin-top">
                {[
                  { source: 'Streaming', amount: 456.78, percentage: 65 },
                  { source: 'Sync Licensing', amount: 189.50, percentage: 27 },
                  { source: 'Merchandise', amount: 56.30, percentage: 8 }
                ].map((item, i) => (
                  <div key={i} className="uk-margin-small-bottom">
                    <div className="uk-flex uk-flex-between uk-text-small">
                      <span className="uk-text-muted">{item.source}</span>
                      <span className="uk-text-white uk-text-bold">${item.amount}</span>
                    </div>
                    <Progress value={item.percentage} variant="primary" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'franken-ui-demo':
        return (
          <div className="uk-height-1-1">
            <FrankenUIDemo />
          </div>
        );

      default:
        return (
          <div className="uk-text-center uk-padding-large">
            <div className="uk-text-muted uk-text-large">Select a workspace to get started</div>
          </div>
        );
    }
  };

  return (
    <div className="uk-height-viewport uk-background-muted uk-flex uk-flex-column uk-theme-zinc dark">
      <TopNavigation />
      
      <div className="uk-flex-1 uk-flex uk-overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <div className={clsx(
          "uk-flex-1 uk-flex uk-overflow-hidden",
          sidebarCollapsed ? "uk-width-1-1" : "uk-width-expand@m"
        )}>
          <div className="uk-flex-1 uk-overflow-auto">
            <div className="uk-padding">
              {renderWorkspaceContent()}
            </div>
          </div>
          
          {/* AI Chat Panel */}
          {chatOpen && (
            <Card className="uk-width-1-4 uk-width-1-1@s">
              <div className="uk-card-header uk-flex uk-flex-between uk-flex-middle">
                <h3 className="uk-card-title uk-text-white uk-margin-remove">AI Assistant</h3>
                <Button
                  onClick={() => setChatOpen(false)}
                  variant="text"
                  uk-icon="close"
                >
                </Button>
              </div>
              
              <div className="uk-card-body">
                {activeAgent ? (
                  <AIChatInterface 
                    agent={activeAgent}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    className="uk-height-large"
                    sessionId={chatSessionId}
                    userId={userId}
                  />
                ) : (
                  <div className="uk-margin-top">
                    <AIStatusPanel />
                    <div className="uk-text-center uk-padding">
                      <div className="uk-text-muted uk-text-small">
                        Select an AI agent to start chatting
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndiiMusicDashboard;
