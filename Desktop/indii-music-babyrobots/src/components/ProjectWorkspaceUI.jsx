import React, { useState, useEffect } from 'react';
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import { Card, Button, Input } from './ui';

const ProjectWorkspaceUI = ({ workspaceId, userId }) => {
  const { isConnected, messages, workspaceData, sendWorkspaceUpdate, sendChatMessage } = useWorkspaceSocket(workspaceId, userId);
  const [currentMessage, setCurrentMessage] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');

  useEffect(() => {
    if (workspaceData) {
      setWorkspaceName(workspaceData.name || '');
      setWorkspaceDescription(workspaceData.description || '');
    }
  }, [workspaceData]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      sendChatMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const handleUpdateWorkspace = () => {
    sendWorkspaceUpdate({ name: workspaceName, description: workspaceDescription });
  };

  return (
    <div className="uk-container uk-container-expand uk-margin-top">
      <Card className="uk-card-body uk-theme-zinc dark uk-margin-bottom">
        <h1 className="uk-card-title uk-text-white">Project Workspace: {workspaceName || 'Loading...'}</h1>
        <p className="uk-text-muted">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        
        <div className="uk-margin-top">
          <label className="uk-form-label uk-text-muted">Workspace Name</label>
          <Input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace Name"
            className="uk-width-1-1 uk-margin-small-bottom"
          />
          <label className="uk-form-label uk-text-muted">Description</label>
          <textarea
            value={workspaceDescription}
            onChange={(e) => setWorkspaceDescription(e.target.value)}
            placeholder="Workspace Description"
            className="uk-textarea uk-width-1-1 uk-margin-small-bottom"
            rows="3"
          ></textarea>
          <Button onClick={handleUpdateWorkspace} variant="primary">Update Workspace Info</Button>
        </div>
      </Card>

      <Card className="uk-card-body uk-theme-zinc dark uk-margin-bottom">
        <h2 className="uk-card-title uk-text-white">Real-time Chat</h2>
        <div className="uk-height-medium uk-overflow-auto uk-background-muted uk-padding-small uk-border-rounded uk-margin-bottom">
          {messages.map((msg, index) => (
            <div key={index} className="uk-margin-small-bottom">
              <span className="uk-text-bold uk-text-electric-400">{msg.senderId === userId ? 'You' : `User ${msg.senderId}`}:</span> {msg.content}
              <span className="uk-text-meta uk-margin-small-left">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
        <div className="uk-flex">
          <Input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            placeholder="Type a message..."
            className="uk-width-expand uk-margin-small-right"
          />
          <Button onClick={handleSendMessage} variant="primary">Send</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProjectWorkspaceUI;
