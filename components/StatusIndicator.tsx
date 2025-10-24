
import React from 'react';
import { ConversationStatus } from '../types';

interface StatusIndicatorProps {
  status: ConversationStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  let color = 'bg-gray-400';
  let text = 'Ready to start';
  let animate = false;

  switch (status) {
    case 'connecting':
      color = 'bg-yellow-400';
      text = 'Connecting...';
      animate = true;
      break;
    case 'connected':
      color = 'bg-green-400';
      text = 'Conversation live';
      animate = true;
      break;
    case 'error':
      color = 'bg-red-500';
      text = 'Error';
      break;
    case 'idle':
    default:
      break;
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-text-secondary">
      <div className={`w-3 h-3 rounded-full ${color} ${animate ? 'animate-pulse' : ''}`}></div>
      <span>{text}</span>
    </div>
  );
};
