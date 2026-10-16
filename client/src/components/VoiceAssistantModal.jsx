import React, { useState, useEffect } from 'react';
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

  // Initialize Speech Recognition if supported
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSendQuery(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendQuery = async (queryText) => {
    const q = queryText || query;
    if (!q || !q.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.processVoiceCommand({ query: q, language });
      setResponse(res);

      // Play audio response automatically
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.answer);
        utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Failed to process voice query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCommands = [
    { text: language === 'mr' ? 'माझी आजची औषधे कोणती आहेत?' : language === 'hi' ? 'मेरी आज की दवाइयां कौन सी हैं?' : 'What medicines do I take today?' },
    { text: language === 'mr' ? 'माझी ॲलर्जी काय आहे?' : language === 'hi' ? 'मुझे किस चीज़ से एलर्जी है?' : 'What are my recorded allergies?' },
    { text: language === 'mr' ? 'माझा शेवटचा रिपोर्ट समजावून सांगा' : language === 'hi' ? 'मेरी पिछली रिपोर्ट समझाएं' : 'Explain my latest lab report' }
  ];

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
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
                {language === 'mr' ? 'मराठी व्हॉईस सहाय्यक' : language === 'hi' ? 'हिंदी वॉयस असिस्टेंट' : 'Multilingual Health Voice Assistant'}
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
              {language === 'mr' ? 'माईक दाबा आणि बोला' : language === 'hi' ? 'माइक दबाएं और बोलें' : 'Tap mic and speak'}
            </p>
          </div>

          {/* Quick Command Suggestions */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              वारंवार विचारले जाणारे प्रश्न:
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="किंवा येथे टाइप करा..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={() => handleSendQuery()}
              disabled={isLoading || !query.trim()}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl disabled:opacity-50 transition"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* Assistant Answer Box */}
          {response && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">🌿 स्मृती सहाय्यक उत्तर:</span>
                {isSpeaking && <span className="text-amber-700 animate-pulse font-bold">🔊 बोलत आहे...</span>}
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {response.answer}
              </p>
              <div className="text-[11px] text-red-800 bg-red-100/60 p-2 rounded-lg border border-red-200">
                {response.disclaimer}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
