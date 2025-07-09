import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RoleSwitcher from '@/components/RoleSwitcher';
import { cn } from '@/lib/utils';

const roleColors = {
  artist: 'bg-artist',
  fan: 'bg-fan',
  licensor: 'bg-licensor',
  provider: 'bg-provider',
  legal: 'bg-legal',
  general: 'bg-general',
};

const roleGradients = {
  artist: 'from-artist/20 via-artist/10 to-background',
  fan: 'from-fan/20 via-fan/10 to-background',
  licensor: 'from-licensor/20 via-licensor/10 to-background',
  provider: 'from-provider/20 via-provider/10 to-background',
  legal: 'from-legal/20 via-legal/10 to-background',
  general: 'from-general/20 via-general/10 to-background',
};

export default function ModernChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState('general');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input, 
          role: currentRole 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { 
          text: data.reply, 
          sender: 'bot', 
          role: data.role || currentRole,
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

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    
    // Add a system message about role change
    const systemMessage = {
      text: `Switched to ${newRole} assistant mode. How can I help you today?`,
      sender: 'system',
      role: newRole,
      timestamp: new Date(),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">i</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  indii.music
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Music Industry Assistant</p>
              </div>
            </div>
          </div>
          
          <RoleSwitcher 
            currentRole={currentRole} 
            onRoleChange={handleRoleChange}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">i</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to indii.music!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              I'm your AI assistant ready to help with music industry questions. 
              Switch roles above to get specialized advice.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-4xl",
              message.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            )}
          >
            {message.sender !== 'user' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className={cn(
                  "text-white text-xs",
                  message.sender === 'system' ? 'bg-muted' : roleColors[message.role] || 'bg-general'
                )}>
                  {message.sender === 'system' ? 'SYS' : 'AI'}
                </AvatarFallback>
              </Avatar>
            )}
            
            <Card className={cn(
              "max-w-[80%] overflow-hidden",
              message.sender === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : message.sender === 'system'
                ? 'bg-muted/50 border-muted'
                : cn(
                    "bg-gradient-to-br border-l-4",
                    `border-l-${message.role || 'general'}`,
                    roleGradients[message.role] || roleGradients.general
                  ),
              message.isError && 'border-destructive bg-destructive/10'
            )}>
              <CardContent className="p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                </div>
                
                {message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.text)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mr-auto justify-start">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className={cn("text-white text-xs", roleColors[currentRole])}>
                AI
              </AvatarFallback>
            </Avatar>
            <Card className={cn(
              "bg-gradient-to-br",
              roleGradients[currentRole] || roleGradients.general
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI is thinking...
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-3 pr-12 bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-[44px] px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
