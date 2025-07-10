import { useState, useRef, useEffect } from 'react';
import { ROLES, getRoleById } from '@/lib/roles';

const roleIcons = {
  artist: '🎵',
  fan: '🎧',
  licensor: '🎬',
  provider: '🛠️',
  legal: '⚖️',
  general: '🎼',
};

const roleColors = {
  artist: 'border-l-purple-500 bg-purple-50',
  fan: 'border-l-green-500 bg-green-50',
  licensor: 'border-l-yellow-500 bg-yellow-50',
  provider: 'border-l-red-500 bg-red-50',
  legal: 'border-l-blue-500 bg-blue-50',
  general: 'border-l-gray-500 bg-gray-50',
};

export default function SimpleModernChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState('general');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { 
      text: input, 
      sender: 'user', 
      timestamp: new Date(),
      id: Date.now()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Prepare chat history for Gemini API
    const geminiHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input, 
          history: geminiHistory 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { 
          text: data.reply, 
          sender: 'bot', 
          role: currentRole, // The AI API doesn't return role, so use currentRole
          timestamp: new Date(),
          id: Date.now() + 1
        };
        setMessages([...newMessages, botMessage]);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot', 
        role: currentRole,
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setShowRoleDropdown(false);
    
    const systemMessage = {
      text: `Switched to ${getRoleById(newRole).name}. How can I help you today?`,
      sender: 'system',
      role: newRole,
      timestamp: new Date(),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const currentRoleInfo = getRoleById(currentRole);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                indii.music
              </h1>
              <p className="text-sm text-gray-600">AI-Powered Music Industry Assistant</p>
            </div>
          </div>
          
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200 min-w-[240px] justify-start shadow-sm"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{roleIcons[currentRole]}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-gray-900">{currentRoleInfo.name}</div>
                <div className="text-xs text-gray-500 truncate">{currentRoleInfo.description}</div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showRoleDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Switch AI Assistant</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {Object.values(ROLES).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                        role.id === currentRole ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{roleIcons[role.id]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{role.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{role.description}</div>
                      </div>
                      {role.id === currentRole && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">i</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Welcome to indii.music!</h3>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
              I'm your AI assistant ready to help with music industry questions. 
              Switch roles above to get specialized advice for artists, fans, licensing, and more.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Object.values(ROLES).slice(0, 3).map((role) => (
                <span key={role.id} className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm text-gray-600 border">
                  <span>{roleIcons[role.id]}</span>
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 max-w-4xl ${
              message.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            }`}
          >
            {message.sender !== 'user' && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0 mt-1">
                <span className="text-sm">
                  {message.sender === 'system' ? '🔄' : roleIcons[message.role] || '🤖'}
                </span>
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              message.sender === 'user' 
                ? 'bg-purple-600 text-white' 
                : message.sender === 'system'
                ? 'bg-blue-50 border border-blue-200'
                : `bg-white border-l-4 ${roleColors[message.role] || roleColors.general}`
            } ${message.isError ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </div>
              
              {message.sender === 'bot' && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => navigator.clipboard.writeText(message.text)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    📋 Copy
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">👍</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">👎</button>
                </div>
              )}
            </div>
            
            {message.sender === 'user' && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-600 flex-shrink-0 mt-1">
                <span className="text-white text-sm font-semibold">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mr-auto justify-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0 mt-1">
              <span className="text-sm">{roleIcons[currentRole]}</span>
            </div>
            <div className={`bg-white border-l-4 ${roleColors[currentRole]} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                AI is thinking...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows="1"
              style={{ minHeight: '52px', maxHeight: '120px' }}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[52px]"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
