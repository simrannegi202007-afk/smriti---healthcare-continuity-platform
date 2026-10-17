import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function VoiceAssistantModal({ onClose, onOpenEmergency }) {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // Initialize Speech Recognition if supported
  const startListening = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let recognizedTranscript = '';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        recognizedTranscript = transcript;
        setQuery(transcript);
      };
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
        // Automatically submit the recognized text after speech finishes
        if (recognizedTranscript && recognizedTranscript.trim()) {
          handleSendQuery(recognizedTranscript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendQuery = async (queryText) => {
    const q = (queryText !== undefined && queryText !== null ? queryText : query);
    if (!q || !q.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.processVoiceCommand({ query: q.trim(), language });
      setResponse(res);

      // Play audio response automatically in selected language
      if (window.speechSynthesis && res.answer) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.answer);
        utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }

      // If action is to open emergency card
      if (res.action === 'open_emergency' && onOpenEmergency) {
        isNavigatingRef.current = true;
        setTimeout(() => {
          onOpenEmergency();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to process voice query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCommands = [
    { text: t('voice.cmd1') },
    { text: t('voice.cmd2') },
    { text: t('voice.cmd3') }
  ];

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (!isNavigatingRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('voice.title')}</h2>
              <p className="text-xs text-amber-100">
                {t('voice.subtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Mic Visualizer & Trigger */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border border-slate-200 rounded-3xl">
            <button
              onClick={startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl tap-target ${
                isListening 
                  ? 'bg-red-600 text-white ring-8 ring-red-200 animate-pulse' 
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-sm font-bold text-slate-800 mt-4">
              {isListening ? t('voice.listening') : t('voice.prompt')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t('voice.tapToSpeak')}
            </p>
          </div>

          {/* Quick Command Suggestions */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('voice.frequentQuestions')}
            </span>
            <div className="flex flex-col space-y-1.5">
              {sampleCommands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(cmd.text);
                    handleSendQuery(cmd.text);
                  }}
                  className="text-left text-xs p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl font-medium text-slate-700 transition"
                >
                  💬 "{cmd.text}"
                </button>
              ))}
            </div>
          </div>

          {/* Text input alternative */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendQuery(query);
                }
              }}
              placeholder={t('voice.typePlaceholder')}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={() => handleSendQuery(query)}
              disabled={isLoading || !query.trim()}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Assistant Answer Box */}
          {response && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">🌿 {t('voice.assistantResponse')}</span>
                {isSpeaking && <span className="text-amber-700 animate-pulse font-bold">🔊 {t('voice.speaking')}</span>}
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {response.answer}
              </p>
              {response.disclaimer && (
                <div className="text-[11px] text-red-800 bg-red-100/60 p-2 rounded-lg border border-red-200">
                  {response.disclaimer}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
