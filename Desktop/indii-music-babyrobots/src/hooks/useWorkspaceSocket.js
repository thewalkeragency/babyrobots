import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useWorkspaceSocket = (workspaceId, userId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [workspaceData, setWorkspaceData] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      console.log('Connected to socket.io server');
      setIsConnected(true);
      socketRef.current.emit('join_workspace', workspaceId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
      setIsConnected(false);
    });

    socketRef.current.on('workspace_updated', (data) => {
      console.log('Received workspace update:', data);
      setWorkspaceData(data);
    });

    socketRef.current.on('new_chat_message', (message) => {
      console.log('Received chat message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_workspace', workspaceId);
        socketRef.current.disconnect();
      }
    };
  }, [workspaceId, userId]);

  const sendWorkspaceUpdate = (data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('workspace_update', workspaceId, data);
    }
  };

  const sendChatMessage = (messageContent) => {
    if (socketRef.current && isConnected) {
      const message = {
        senderId: userId,
        content: messageContent,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('chat_message', workspaceId, message);
    }
  };

  return { isConnected, messages, workspaceData, sendWorkspaceUpdate, sendChatMessage };
};
