import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../UI';
import { clsx } from 'clsx';
import {
  MusicalNoteIcon,
  FolderIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  GlobeAltIcon,
  FilmIcon,
  DocumentTextIcon,
  CommandLineIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const CursorStyleDashboard = ({ userRole = 'artist', userId, currentUser }) => {
  const [activeWorkspace, setActiveWorkspace] = useState('tracks');
  const [activeAgent, setActiveAgent] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [chatOpen, setChatOpen] = useState(false);

  // AI Agents available by role
  const getAvailableAgents = () => {
    const baseAgents = [
      { id: 'general', name: 'General Assistant', icon: 'bot', color: 'bg-gray-500' },
    ];
    
    switch (userRole) {
      case 'artist':
        return [
          { id: 'artwork', name: 'Artwork Creator', icon: 'palette', color: 'bg-purple-500' },
          { id: 'marketing', name: 'Marketing Agent', icon: 'trending-up', color: 'bg-blue-500' },
          { id: 'distribution', name: 'Distribution', icon: 'globe', color: 'bg-green-500' },
          { id: 'mastering', name: 'Audio Mastering', icon: 'music', color: 'bg-orange-500' },
          ...baseAgents,
        ];
      case 'licensor':
        return [
          { id: 'sync', name: 'Sync Licensing', icon: 'film', color: 'bg-yellow-500' },
          { id: 'contracts', name: 'Contract Analysis', icon: 'file-text', color: 'bg-red-500' },
          ...baseAgents,
        ];
      default:
        return baseAgents;
    }
  };

  const workspaces = [
    { id: 'tracks', name: 'Tracks', icon: 'music' },
    { id: 'projects', name: 'Projects', icon: 'folder' },
    { id: 'database', name: 'Database', icon: 'database', badge: 'NEW' },
    { id: 'artwork', name: 'Artwork', icon: 'palette' },
    { id: 'marketing', name: 'Marketing', icon: 'trending-up' },
    { id: 'analytics', name: 'Analytics', icon: 'bar-chart' },
  ];

  const agents = getAvailableAgents();

  const getWorkspaceIcon = (iconName) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case 'music': return <MusicalNoteIcon {...iconProps} />;
      case 'folder': return <FolderIcon {...iconProps} />;
      case 'database': return <CircleStackIcon {...iconProps} />;
      case 'palette': return <PaintBrushIcon {...iconProps} />;
      case 'trending-up': return <ArrowTrendingUpIcon {...iconProps} />;
      case 'bar-chart': return <ChartBarIcon {...iconProps} />;
      case 'globe': return <GlobeAltIcon {...iconProps} />;
      case 'film': return <FilmIcon {...iconProps} />;
      case 'file-text': return <DocumentTextIcon {...iconProps} />;
      case 'bot': return <CommandLineIcon {...iconProps} />;
      default: return <FolderIcon {...iconProps} />;
    }
  };

  const getAgentIcon = (iconName) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case 'palette': return <PaintBrushIcon {...iconProps} />;
      case 'trending-up': return <ArrowTrendingUpIcon {...iconProps} />;
      case 'globe': return <GlobeAltIcon {...iconProps} />;
      case 'music': return <MusicalNoteIcon {...iconProps} />;
      case 'film': return <FilmIcon {...iconProps} />;
      case 'file-text': return <DocumentTextIcon {...iconProps} />;
      case 'bot': return <CommandLineIcon {...iconProps} />;
      default: return <CommandLineIcon {...iconProps} />;
    }
  };

  const ProjectExplorer = () => (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Explorer Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Explorer</h3>
      </div>
      
      {/* Workspace Tabs */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors',
                activeWorkspace === workspace.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {getWorkspaceIcon(workspace.icon)}
              <span>{workspace.name}</span>
              {workspace.badge && (
                <Badge size="sm" variant="success" className="text-xs">
                  {workspace.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* File Tree / Project Structure */}
      <div className="p-4">
        <div className="space-y-2">
          {activeWorkspace === 'tracks' && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <FolderIcon className="h-4 w-4" />
                <span className="font-medium">My Tracks</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer">
                  <MusicalNoteIcon className="h-4 w-4" />
                  <span>Summer Vibes.wav</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer">
                  <MusicalNoteIcon className="h-4 w-4" />
                  <span>Midnight Drive.mp3</span>
                </div>
              </div>
            </>
          )}
          
          {activeWorkspace === 'artwork' && (
            <>
              <div className="flex items-center space-x-2 text-sm">
                <FolderIcon className="h-4 w-4" />
                <span className="font-medium">Artwork Projects</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer">
                  <PaintBrushIcon className="h-4 w-4" />
                  <span>Album Cover Draft 1.psd</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Social Media Assets</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const MainWorkspace = () => (
    <div className="flex-1 bg-white dark:bg-gray-800">
      {/* Workspace Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {workspaces.find(w => w.id === activeWorkspace)?.name}
            </h2>
            {activeAgent && (
              <Badge variant="primary" className="flex items-center space-x-1">
                {getAgentIcon(agents.find(a => a.id === activeAgent)?.icon)}
                <span>{agents.find(a => a.id === activeAgent)?.name}</span>
              </Badge>
            )}
          </div>
          <Button
            onClick={() => setChatOpen(!chatOpen)}
            variant={chatOpen ? "primary" : "outline"}
            size="sm"
          >
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="w-full max-w-4xl mx-auto">
        {activeWorkspace === 'tracks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Tracks</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">SV</span>
                      </div>
                      <div>
                        <div className="font-medium">Summer Vibes</div>
                        <div className="text-sm text-gray-500">3:45 • Mixed</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MusicalNoteIcon className="h-4 w-4 mr-2" />
                    Upload New Track
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setActiveAgent('artwork');
                      setChatOpen(true);
                    }}
                  >
                    <PaintBrushIcon className="h-4 w-4 mr-2" />
                    Create Artwork
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                    Start Marketing Campaign
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeWorkspace === 'database' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                    <CircleStackIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Database Overview</h3>
                    <Badge className="mt-1" variant="success">NEW</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Music & Content Management System showcasing the newly implemented database features.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MusicalNoteIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Tracks Table</span>
                    </div>
                    <span className="text-sm text-gray-500">125 records</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Split Sheets</span>
                    </div>
                    <span className="text-sm text-gray-500">42 agreements</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderIcon className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Workspaces</span>
                    </div>
                    <span className="text-sm text-gray-500">8 active</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">+</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">New track uploaded</div>
                      <div className="text-xs text-gray-500">"Midnight Drive" added to database</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Split sheet completed</div>
                      <div className="text-xs text-gray-500">Revenue shares finalized</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeWorkspace === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">EP</span>
                      </div>
                      <div>
                        <div className="font-medium">Summer EP 2024</div>
                        <div className="text-sm text-gray-500">4 tracks • In Progress</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Open</Button>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Project Tools</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Import Project
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeWorkspace === 'marketing' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Marketing Campaigns</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Plan, execute, and track your marketing campaigns. Use AI to generate strategic insights and reach your target audience effectively.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Social Media Campaign</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Promote new single across platforms</p>
                  <div className="mt-2">
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Email Marketing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fan engagement and updates</p>
                  <div className="mt-2">
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </div>
              </div>
              <Button className="w-full" variant="primary">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                Plan New Campaign
              </Button>
            </Card>
          </div>
        )}

        {activeWorkspace === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Streaming Stats</h3>
                <div className="text-3xl font-bold text-blue-500 mb-2">12.5K</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total plays this month</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                <div className="text-3xl font-bold text-green-500 mb-2">$892</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Earnings this quarter</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Engagement</h3>
                <div className="text-3xl font-bold text-purple-500 mb-2">2.3K</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">New followers</p>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Access detailed insights and visualize data on all aspects of your projects to make informed decisions. Customize dashboards to suit your analytical needs.
              </p>
              <Button variant="primary">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </Card>
          </div>
        )}

        {activeWorkspace === 'artwork' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-4"></div>
                  <h4 className="font-medium mb-2">Artwork {i}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Album cover concept
                  </p>
                  <Button size="sm" className="w-full">Edit</Button>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  const AgentPanel = () => (
    <div className={clsx(
      'border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-all duration-300',
      chatOpen ? 'w-80' : 'w-0 overflow-hidden'
    )}>
      {chatOpen && (
        <div className="h-full flex flex-col">
          {/* Agent Selector */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Agents</h3>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={clsx(
                    'p-3 rounded-lg text-left transition-colors border',
                    activeAgent === agent.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(agent.icon)}
                    <span className="text-sm font-medium truncate">{agent.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {activeAgent ? (
                <>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAgentIcon(agents.find(a => a.id === activeAgent)?.icon)}
                      <span className="font-medium">{agents.find(a => a.id === activeAgent)?.name}</span>
                    </div>
                    <p className="text-sm">
                      {activeAgent === 'artwork' && "I can help you create album covers, social media assets, and promotional materials. What would you like to create?"}
                      {activeAgent === 'marketing' && "I can help you plan marketing campaigns, write promotional copy, and schedule social media posts. What's your goal?"}
                      {activeAgent === 'general' && "I'm here to help with any questions about your music projects. How can I assist you?"}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask your AI agent..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select an AI agent to start chatting
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-white dark:bg-gray-800">
      {/* Project Explorer Sidebar */}
      <div style={{ width: sidebarWidth }} className="flex-shrink-0">
        <ProjectExplorer />
      </div>

      {/* Main Workspace */}
      <MainWorkspace />

      {/* AI Agent Panel */}
      <AgentPanel />
    </div>
  );
};

export default CursorStyleDashboard;
