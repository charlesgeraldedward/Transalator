
import React from 'react';
import { ConversationStatus } from '../types';
import { StatusIndicator } from './StatusIndicator';

interface ConversationControlsProps {
  status: ConversationStatus;
  onToggle: () => void;
}

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
    </svg>
);

export const ConversationControls: React.FC<ConversationControlsProps> = ({ status, onToggle }) => {
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';

  let buttonText = 'Start Practice';
  if (isConnecting) buttonText = 'Connecting...';
  if (isConnected) buttonText = 'Stop Practice';
  
  const buttonIcon = isConnected ? <StopIcon /> : <MicIcon />;
  
  const buttonBaseClasses = "px-6 py-3 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4";
  const buttonColorClasses = isConnected 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/50 text-white" 
    : "bg-brand-secondary hover:bg-brand-primary focus:ring-brand-secondary/50 text-white";
  const disabledClasses = "disabled:opacity-50 disabled:cursor-wait";

  return (
    <div className="flex flex-col items-center space-y-3">
        <StatusIndicator status={status}/>
        <button
            onClick={onToggle}
            disabled={isConnecting}
            className={`${buttonBaseClasses} ${buttonColorClasses} ${disabledClasses}`}
        >
            {buttonIcon}
            <span>{buttonText}</span>
        </button>
    </div>
  );
};
