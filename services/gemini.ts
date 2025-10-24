// FIX: Removed `LiveSession` from the import statement because it is not an exported member of the '@google/genai' module.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { createBlob, decodeAudioData, decode } from '../utils/audio';

// FIX: Replaced `LiveSession` with `any` for the session promise type, as `LiveSession` is not available for use.
let sessionPromise: Promise<any> | null = null;
let stream: MediaStream | null = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
let outputNode: GainNode | null = null;
let sources = new Set<AudioBufferSourceNode>();
let nextStartTime = 0;

interface StartConversationParams {
  language: string;
  scenario: string;
  onMessage: (message: { type: 'transcriptionUpdate' | 'turnComplete', sender?: 'user' | 'ai', text?: string }) => void;
  onOpen: () => void;
  onClose: () => void;
  onError: (error: string) => void;
}

export const startConversation = async (params: StartConversationParams) => {
  const { language, scenario, onMessage, onOpen, onClose, onError } = params;

  if (!process.env.API_KEY) {
    onError("API key is not set. Please set the API_KEY environment variable.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    onError("Microphone access was denied. Please allow microphone access in your browser settings.");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);
  
  const systemInstruction = `You are a conversational partner helping a user practice the ${language} language. The scenario is: "${scenario}". You must speak only in ${language}. Keep your responses concise and natural for a real conversation.`;

  sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction,
    },
    callbacks: {
      onopen: () => {
        onOpen();
        mediaStreamSource = inputAudioContext!.createMediaStreamSource(stream!);
        scriptProcessor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise?.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext!.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          onMessage({ type: 'transcriptionUpdate', sender: 'user', text: message.serverContent.inputTranscription.text });
        }
        if (message.serverContent?.outputTranscription) {
          onMessage({ type: 'transcriptionUpdate', sender: 'ai', text: message.serverContent.outputTranscription.text });
        }
        if (message.serverContent?.turnComplete) {
            onMessage({type: 'turnComplete'});
        }

        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext!.currentTime);
            const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputAudioContext!,
                24000,
                1
            );
            const source = outputAudioContext!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode!);
            source.addEventListener('ended', () => {
                sources.delete(source);
            });
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(source);
        }

        if (message.serverContent?.interrupted) {
            for(const source of sources.values()){
                source.stop();
                sources.delete(source);
            }
            nextStartTime = 0;
        }
      },
      onerror: (e: ErrorEvent) => {
        console.error('Gemini Live API Error:', e);
        onError('A connection error occurred.');
        stopConversation();
      },
      onclose: (e: CloseEvent) => {
        onClose();
      },
    }
  });
};

export const stopConversation = () => {
  sessionPromise?.then((session) => {
    session.close();
  });
  sessionPromise = null;

  stream?.getTracks().forEach(track => track.stop());
  stream = null;

  mediaStreamSource?.disconnect();
  scriptProcessor?.disconnect();
  mediaStreamSource = null;
  scriptProcessor = null;

  inputAudioContext?.close();
  outputAudioContext?.close();
  inputAudioContext = null;
  outputAudioContext = null;

  sources.forEach(source => source.stop());
  sources.clear();
  nextStartTime = 0;
};