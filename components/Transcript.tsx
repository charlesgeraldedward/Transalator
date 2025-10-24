
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface TranscriptProps {
  transcript: Message[];
  liveTranscription: {
    user: string;
    ai: string;
  };
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClasses = isUser
      ? 'bg-brand-secondary self-end'
      : 'bg-bg-tertiary self-start';
    const textClasses = isUser ? 'text-white' : 'text-text-primary';

    return (
      <div className={`p-3 rounded-xl max-w-lg ${bubbleClasses} ${textClasses} shadow-md`}>
        <p className="text-sm">{message.text}</p>
      </div>
    );
};

const LiveTranscriptBubble: React.FC<{ text: string; sender: 'user' | 'ai' }> = ({ text, sender }) => {
    if (!text) return null;
    const isUser = sender === 'user';
    const bubbleClasses = isUser ? 'bg-brand-secondary/70 self-end' : 'bg-bg-tertiary/70 self-start';
    const textClasses = isUser ? 'text-white/80' : 'text-text-primary/80';
    
    return (
        <div className={`p-3 rounded-xl max-w-lg ${bubbleClasses} ${textClasses} italic`}>
            <p className="text-sm">{text}</p>
        </div>
    );
}


export const Transcript: React.FC<TranscriptProps> = ({ transcript, liveTranscription }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveTranscription]);

  return (
    <div className="flex-grow bg-bg-primary/50 rounded-lg p-4 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        {transcript.length === 0 && !liveTranscription.user && (
            <div className="text-center text-text-secondary h-full flex items-center justify-center">
                <p>Your conversation will appear here.</p>
            </div>
        )}
        {transcript.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <LiveTranscriptBubble text={liveTranscription.user} sender="user" />
        <LiveTranscriptBubble text={liveTranscription.ai} sender="ai" />
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};
