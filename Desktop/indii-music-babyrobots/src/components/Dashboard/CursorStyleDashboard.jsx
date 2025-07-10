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
  CommandLineIcon
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
      <div className="p-6">
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
