
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'error';
