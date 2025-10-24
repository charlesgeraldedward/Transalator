import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ConversationStatus, Message } from './types';
import { LANGUAGES, SCENARIOS, INACTIVITY_TIMEOUT_MS } from './constants';
import * as geminiLiveService from './services/gemini';
import { SettingsPanel } from './components/SettingsPanel';
import { ConversationControls } from './components/ConversationControls';
import { Transcript } from './components/Transcript';

const App: React.FC = () => {
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [scenario, setScenario] = useState(SCENARIOS[0].value);
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const [liveTranscription, setLiveTranscription] = useState({ user: '', ai: '' });
  const inactivityTimerRef = useRef<number | null>(null);

  const handleToggleConversation = useCallback(async () => {
    const clearInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };

    const resetInactivityTimer = () => {
      clearInactivityTimer();
      inactivityTimerRef.current = window.setTimeout(() => {
        geminiLiveService.stopConversation();
        setError("Conversation ended automatically due to inactivity.");
      }, INACTIVITY_TIMEOUT_MS);
    };

    if (status === 'idle' || status === 'error') {
      setStatus('connecting');
      setError(null);
      setTranscript([]);
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
      setLiveTranscription({ user: '', ai: '' });

      try {
        await geminiLiveService.startConversation({
          language,
          scenario,
          onMessage: (message) => {
            resetInactivityTimer();
             if (message.type === 'transcriptionUpdate') {
              if (message.sender === 'user') {
                currentInputTranscriptionRef.current += message.text;
              } else {
                currentOutputTranscriptionRef.current += message.text;
              }
              setLiveTranscription({
                user: currentInputTranscriptionRef.current,
                ai: currentOutputTranscriptionRef.current,
              });
            } else if (message.type === 'turnComplete') {
              const fullInput = currentInputTranscriptionRef.current;
              const fullOutput = currentOutputTranscriptionRef.current;
              
              setTranscript(prev => {
                  const newMessages: Message[] = [];
                  if(fullInput.trim()){
                      newMessages.push({ id: `user-${Date.now()}`, sender: 'user', text: fullInput });
                  }
                   if(fullOutput.trim()){
                      newMessages.push({ id: `ai-${Date.now()}`, sender: 'ai', text: fullOutput });
                  }
                  return [...prev, ...newMessages];
              });

              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
              setLiveTranscription({ user: '', ai: '' });
            }
          },
          onOpen: () => {
            setStatus('connected');
            resetInactivityTimer();
          },
          onClose: () => {
            setStatus('idle');
            clearInactivityTimer();
          },
          onError: (errorMessage) => {
            setError(errorMessage);
            setStatus('error');
            clearInactivityTimer();
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setStatus('error');
        clearInactivityTimer();
      }
    } else {
      geminiLiveService.stopConversation();
      clearInactivityTimer();
    }
  }, [status, language, scenario]);
  
  const isConversationRunning = status === 'connecting' || status === 'connected';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-bg-secondary rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-bg-tertiary flex-shrink-0">
          <h1 className="text-xl font-bold text-text-primary">AI Language Partner</h1>
        </header>
        
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          <aside className="w-full md:w-1/3 lg:w-1/4 p-4 border-b md:border-b-0 md:border-r border-bg-tertiary overflow-y-auto">
            <SettingsPanel
              language={language}
              onLanguageChange={setLanguage}
              scenario={scenario}
              onScenarioChange={setScenario}
              disabled={isConversationRunning}
            />
          </aside>

          <main className="flex-grow p-4 flex flex-col overflow-hidden">
            <Transcript transcript={transcript} liveTranscription={liveTranscription} />
          </main>
        </div>
        
        <footer className="p-4 border-t border-bg-tertiary flex flex-col items-center justify-center flex-shrink-0">
          {error && <p className="text-red-400 mb-2 text-sm">{error}</p>}
          <ConversationControls status={status} onToggle={handleToggleConversation} />
        </footer>
      </div>
    </div>
  );
};

export default App;