import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MusicalNoteIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  FilmIcon,
  DocumentTextIcon,
  CommandLineIcon,
  CurrencyDollarIcon,
  UserIcon,
  SparklesIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// AI Agent Card Component
export const AIAgentCard = ({ 
  agent, 
  isActive = false, 
  onClick,
  className,
  showStatus = true,
  compact = false 
}) => {
  const getAgentIcon = (iconName) => {
    const iconProps = { className: "h-5 w-5" };
    switch (iconName) {
      case 'mastering': return <MusicalNoteIcon {...iconProps} />;
      case 'artwork': return <PaintBrushIcon {...iconProps} />;
      case 'marketing': return <ArrowTrendingUpIcon {...iconProps} />;
      case 'distribution': return <GlobeAltIcon {...iconProps} />;
      case 'sync': return <FilmIcon {...iconProps} />;
      case 'legal': return <DocumentTextIcon {...iconProps} />;
      case 'royalty': return <CurrencyDollarIcon {...iconProps} />;
      case 'general': return <CommandLineIcon {...iconProps} />;
      default: return <UserIcon {...iconProps} />;
    }
  };

  const getAgentGradient = (type) => {
    const gradients = {
      mastering: 'from-orange-500 to-red-600',
      artwork: 'from-purple-500 to-pink-600',
      marketing: 'from-blue-500 to-cyan-600',
      distribution: 'from-green-500 to-emerald-600',
      sync: 'from-yellow-500 to-orange-600',
      legal: 'from-indigo-500 to-purple-600',
      royalty: 'from-emerald-500 to-teal-600',
      general: 'from-gray-500 to-gray-600',
    };
    return gradients[type] || gradients.general;
  };

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(agent)}
        className={clsx(
          "group relative p-3 rounded-lg transition-all duration-200 border",
          isActive 
            ? "bg-electric-600/20 border-electric-500 shadow-lg shadow-electric-500/20"
            : "bg-studio-800 border-technical-700 hover:bg-studio-700 hover:border-technical-600",
          className
        )}
      >
        <div className="flex items-center space-x-3">
          <div className={clsx(
            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm",
            getAgentGradient(agent.type)
          )}>
            {getAgentIcon(agent.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{agent.name}</div>
            {showStatus && (
              <div className="flex items-center space-x-1 mt-1">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  agent.status === 'active' ? 'bg-audio-levels' : 
                  agent.status === 'busy' ? 'bg-audio-warning' : 'bg-technical-600'
                )} />
                <span className="text-xs text-technical-400 capitalize">{agent.status || 'idle'}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => onClick?.(agent)}
      className={clsx(
        "group relative p-4 rounded-lg transition-all duration-200 border cursor-pointer",
        isActive 
          ? "bg-electric-600/20 border-electric-500 shadow-lg shadow-electric-500/20"
          : "bg-studio-800 border-technical-700 hover:bg-studio-700 hover:border-technical-600",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={clsx(
          "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
          getAgentGradient(agent.type)
        )}>
          {getAgentIcon(agent.icon)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
          <p className="text-sm text-technical-400 leading-5 mb-2">{agent.description}</p>
          
          {showStatus && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  agent.status === 'active' ? 'bg-audio-levels animate-pulse' : 
                  agent.status === 'busy' ? 'bg-audio-warning' : 'bg-technical-600'
                )} />
                <span className="text-xs text-technical-400 capitalize">{agent.status || 'idle'}</span>
              </div>
              
              {agent.lastMessage && (
                <span className="text-xs text-electric-400">{agent.lastMessage}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-electric-500 to-electric-600 rounded-lg opacity-30 blur-sm -z-10" />
      )}
    </div>
  );
};

// AI Chat Interface
export const AIChatInterface = ({ 
  agent, 
  messages: initialMessages = [], 
  onSendMessage,
  className,
  sessionId,
  userId
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (sessionId && userId) {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(`/api/chat/history?sessionId=${sessionId}&userId=${userId}`);
          const data = await response.json();
          if (response.ok) {
            setMessages(data.history);
          } else {
            console.error('Failed to fetch chat history:', data.error);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };
      fetchChatHistory();
    }
  }, [sessionId, userId]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    
    const newMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage, role: agent?.id || 'general', sessionId, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiResponse = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        console.error('AI chat failed:', data.error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}`, timestamp: new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to AI.', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={clsx("bg-studio-800 rounded-lg border border-technical-700 flex flex-col h-96", className)}>
      {/* Chat Header */}
      <div className="p-4 border-b border-technical-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center text-white text-sm font-bold">
            {agent?.name?.charAt(0) || 'AI'}
          </div>
          <div>
            <div className="font-medium text-white">{agent?.name || 'AI Assistant'}</div>
            <div className="text-xs text-technical-400">{agent?.specialty || 'General Assistant'}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center text-white">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <p className="text-technical-400 text-sm">
              Hi! I'm your {agent?.name || 'AI Assistant'}. How can I help you today?
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={clsx(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  "max-w-xs px-4 py-2 rounded-lg",
                  message.role === 'user'
                    ? "bg-electric-600 text-white"
                    : "bg-studio-900 text-technical-200 border border-technical-700"
                )}
              >
                <div className="text-sm prose prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-studio-900 text-technical-200 border border-technical-700 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-electric-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-technical-700">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${agent?.name || 'AI Assistant'} anything...`}
            className="flex-1 bg-studio-900 border border-technical-700 rounded-lg px-3 py-2 text-white placeholder-technical-500 resize-none focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="bg-electric-600 hover:bg-electric-500 disabled:bg-technical-700 disabled:text-technical-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Agent Grid
export const AIAgentGrid = ({ 
  agents = [], 
  activeAgent, 
  onAgentSelect,
  className 
}) => {
  return (
    <div className={clsx("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3", className)}>
      {agents.map((agent) => (
        <AIAgentCard
          key={agent.id}
          agent={agent}
          isActive={activeAgent?.id === agent.id}
          onClick={onAgentSelect}
          compact
        />
      ))}
    </div>
  );
};

// AI Status Panel
export const AIStatusPanel = ({ className }) => {
  const [activeAgents, setActiveAgents] = useState(3);
  const [totalRequests, setTotalRequests] = useState(247);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalRequests(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={clsx("bg-studio-800 rounded-lg p-4 border border-technical-700", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">AI System Status</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BoltIcon className="h-5 w-5 text-electric-400" />
            <span className="text-technical-400">Active Agents</span>
          </div>
          <span className="text-white font-mono">{activeAgents}/6</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-audio-levels" />
            <span className="text-technical-400">Requests Today</span>
          </div>
          <span className="text-white font-mono">{totalRequests}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-audio-levels rounded-full animate-pulse" />
            <span className="text-technical-400">System Status</span>
          </div>
          <span className="text-audio-levels text-sm font-medium">Operational</span>
        </div>
        
        <div className="pt-2 border-t border-technical-700">
          <div className="text-xs text-technical-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Actions for AI Agents
export const AIQuickActions = ({ onAction, className }) => {
  const actions = [
    { id: 'master', label: 'Quick Master', icon: 'mastering', color: 'from-orange-500 to-red-600' },
    { id: 'artwork', label: 'Generate Art', icon: 'artwork', color: 'from-purple-500 to-pink-600' },
    { id: 'market', label: 'Plan Campaign', icon: 'marketing', color: 'from-blue-500 to-cyan-600' },
    { id: 'distribute', label: 'Upload Track', icon: 'distribution', color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className={clsx("space-y-2", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction?.(action)}
          className="w-full flex items-center space-x-3 p-3 bg-studio-800 hover:bg-studio-700 border border-technical-700 hover:border-technical-600 rounded-lg transition-all duration-200 group"
        >
          <div className={clsx(
            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white",
            action.color
          )}>
            {action.icon === 'mastering' && <MusicalNoteIcon className="h-4 w-4" />}
            {action.icon === 'artwork' && <PaintBrushIcon className="h-4 w-4" />}
            {action.icon === 'marketing' && <ArrowTrendingUpIcon className="h-4 w-4" />}
            {action.icon === 'distribution' && <GlobeAltIcon className="h-4 w-4" />}
          </div>
          <span className="text-sm font-medium text-white group-hover:text-electric-400 transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};
