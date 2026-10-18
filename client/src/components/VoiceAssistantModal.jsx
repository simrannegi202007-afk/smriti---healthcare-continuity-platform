import React, { useState, useEffect, useRef } from 'react';
import { useTTS } from '../utils/useTTS';
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
  const { speak: ttsSpeak, stop: ttsStop, isSpeaking, isLoading: ttsLoading, fallbackUsed } = useTTS();
  const queryRef = useRef('');
  const recognitionRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // Keep queryRef synchronized
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

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
      const activeLang = language || 'en';
      recognition.lang = activeLang === 'mr' ? 'mr-IN' : activeLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      let recognizedTranscript = '';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        recognizedTranscript = transcript;
        queryRef.current = transcript;
        setQuery(transcript);
      };
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
        // Automatically submit the recognized text after speech finishes (Requirement 2)
        const finalQuery = recognizedTranscript || queryRef.current;
        if (finalQuery && finalQuery.trim()) {
          handleSendQuery(finalQuery.trim());
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendQuery = async (queryText) => {
    const q = (queryText !== undefined && queryText !== null ? queryText : (queryRef.current || query));
    if (!q || !q.trim()) return;

    const trimmed = q.trim();
    setQuery(trimmed);
    queryRef.current = trimmed;
    setIsLoading(true);

    try {
      const activeLang = language || 'en';
      const res = await api.processVoiceCommand({ query: trimmed, language: activeLang });
      setResponse(res);

      // Auto-play response via Gemini TTS
      if (res.answer) {
        const lang = activeLang === 'mr' ? 'mr-IN' : activeLang === 'hi' ? 'hi-IN' : 'en-IN';
        ttsSpeak(res.answer, lang);
      }

      // If action is to open emergency card (Requirement 3)
      if (res.action === 'open_emergency' && onOpenEmergency) {
        isNavigatingRef.current = true;
        setTimeout(() => {
          onOpenEmergency();
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to process voice query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    const val = queryRef.current || query;
    if (val && val.trim()) {
      handleSendQuery(val.trim());
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
      ttsStop();
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

          {/* Text input alternative & send action (Requirement 1) */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                queryRef.current = e.target.value;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={t('voice.typePlaceholder')}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading || !(query && query.trim())}
              aria-label="Send query"
              className="p-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl disabled:opacity-50 transition cursor-pointer shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {/* Assistant Answer Box */}
          {response && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">🌿 {t('voice.assistantResponse')}</span>
                <div className="flex items-center space-x-2">
                  {ttsLoading && (
                    <span className="text-amber-700 animate-pulse font-bold flex items-center space-x-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating audio…</span>
                    </span>
                  )}
                  {isSpeaking && !ttsLoading && (
                    <button
                      onClick={() => ttsStop()}
                      className="text-amber-700 animate-pulse font-bold flex items-center space-x-1 hover:text-red-700 transition"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{t('voice.speaking')}</span>
                    </button>
                  )}
                  {!ttsLoading && !isSpeaking && response.answer && (
                    <button
                      onClick={() => {
                        const activeLang = language || 'en';
                        const lang = activeLang === 'mr' ? 'mr-IN' : activeLang === 'hi' ? 'hi-IN' : 'en-IN';
                        ttsSpeak(response.answer, lang);
                      }}
                      className="text-amber-600 hover:text-amber-800 font-bold flex items-center space-x-1 transition"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{t('chatbot.readAloud')}</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {response.answer}
              </p>
              {response.disclaimer && (
                <div className="text-[11px] text-red-800 bg-red-100/60 p-2 rounded-lg border border-red-200">
                  {response.disclaimer}
                </div>
              )}
              {fallbackUsed && (
                <p className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                  ⚠️ Using browser voice (Gemini TTS unavailable)
                </p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
