import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTTS } from '../utils/useTTS';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Send,
  Loader2,
  Bot,
  Sparkles
} from 'lucide-react';

// Persistent chat history across navigations (module-level)
let persistedMessages = null;

export default function ChatbotModal({ onClose, onOpenEmergency }) {
  const { t } = useTranslation();
  const { language: appLanguage } = useAuth();

  // Chat language: if app is Marathi → default Hindi, else follow app language (en/hi only)
  const defaultChatLang = appLanguage === 'mr' ? 'hi' : (appLanguage === 'hi' ? 'hi' : 'en');
  const [chatLang, setChatLang] = useState(defaultChatLang);

  const welcomeMessages = [
    { id: 'w1', role: 'assistant', text: 'Hello! How can I help you? 🌿', lang: 'en' },
    { id: 'w2', role: 'assistant', text: 'नमस्ते! मैं आपकी कैसे सहायता कर सकता हूँ? 🌿', lang: 'hi' }
  ];

  const [messages, setMessages] = useState(persistedMessages || welcomeMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // Single shared TTS instance for all message read-aloud buttons
  const { speak: ttsSpeak, stop: ttsStop, isSpeaking: ttsSpeaking, isLoading: ttsLoading, fallbackUsed } = useTTS();
  const [activeTtsMsgId, setActiveTtsMsgId] = useState(null);

  const inputRef = useRef('');
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const containerRef = useRef(null);

  // Persist messages on every change
  useEffect(() => {
    persistedMessages = messages;
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      ttsStop();
    };
  }, []);

  const suggestedChips = chatLang === 'hi'
    ? [
        t('chatbot.chip1Hi'),
        t('chatbot.chip2Hi'),
        t('chatbot.chip3Hi'),
        t('chatbot.chip4Hi')
      ]
    : [
        t('chatbot.chip1En'),
        t('chatbot.chip2En'),
        t('chatbot.chip3En'),
        t('chatbot.chip4En')
      ];


  const addMessage = (role, text) => {
    const id = `msg-${Date.now()}-${Math.random()}`;
    setMessages(prev => [...prev, { id, role, text }]);
    return id;
  };

  const sendMessage = useCallback(async (text) => {
    const q = (text || input || inputRef.current || '').trim();
    if (!q) return;
    setInput('');
    inputRef.current = '';
    addMessage('user', q);
    setIsLoading(true);

    try {
      // Try the dedicated chat endpoint first, fall back to voice-command
      let answer = '';
      let action = null;
      try {
        const res = await api.chatMessage({ message: q, language: chatLang });
        answer = res.answer || res.reply || '';
        action = res.action;
      } catch (apiErr) {
        // Fallback: reuse existing voice-command keyword logic
        const res = await api.processVoiceCommand({ query: q, language: chatLang });
        answer = res.answer || '';
        action = res.action;
      }

      const msgId = `msg-${Date.now()}`;
      setMessages(prev => [...prev, { id: msgId, role: 'assistant', text: answer }]);

      // Handle action
      if (action === 'open_emergency' && onOpenEmergency) {
        isNavigatingRef.current = true;
        setTimeout(() => { onOpenEmergency(); }, 900);
      }
    } catch (err) {
      // Local keyword fallback when everything fails
      const lower = q.toLowerCase();
      let fallback = chatLang === 'hi'
        ? 'मैं दवाइयों, एलर्जी, रिपोर्ट, ब्लड ग्रुप या इमरजेंसी कार्ड में मदद कर सकता हूँ।'
        : 'I can help with medicines, allergies, reports, blood group, or emergency card.';
      if (lower.includes('medicine') || lower.includes('दवा') || lower.includes('दवाई')) {
        fallback = chatLang === 'hi'
          ? 'आपकी दवाइयों की जानकारी के लिए कृपया "Medicines" टैब खोलें।'
          : 'To view your medicines, please open the Medicines tab.';
      } else if (lower.includes('allerg') || lower.includes('एलर्जी')) {
        fallback = chatLang === 'hi'
          ? 'आपकी एलर्जी की जानकारी आपके स्वास्थ्य प्रोफाइल में दर्ज है।'
          : 'Your allergy information is saved in your health profile.';
      }
      const msgId = `msg-${Date.now()}-fb`;
      setMessages(prev => [...prev, { id: msgId, role: 'assistant', text: fallback }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, chatLang, onOpenEmergency]);

  const startListening = () => {
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('chatbot.noSpeech'));
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = chatLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      let recognized = '';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        recognized = transcript;
        inputRef.current = transcript;
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        const final = recognized || inputRef.current;
        if (final && final.trim()) sendMessage(final.trim());
      };
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (err) {}
    }
    sendMessage(inputRef.current || input);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4 sm:pr-6">
      <div
        ref={containerRef}
        className="bg-white w-full sm:w-[420px] sm:max-w-[420px] h-[92dvh] sm:h-[640px] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 animate-scaleUp overflow-hidden"
        style={{ maxHeight: '92dvh' }}
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="relative p-1.5 bg-white/20 rounded-xl">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 text-[9px] bg-amber-400 text-amber-900 font-black px-1 rounded-full leading-tight">AI</span>
            </div>
            <div>
              <h2 className="text-sm font-black leading-tight">{t('chatbot.title')}</h2>
              <p className="text-[10px] text-emerald-100 leading-tight">{t('chatbot.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* EN / हिंदी toggle */}
            <div className="flex items-center bg-white/15 rounded-xl p-0.5 text-[10px] font-black">
              <button
                onClick={() => setChatLang('en')}
                className={`px-2 py-1 rounded-lg transition ${chatLang === 'en' ? 'bg-white text-emerald-800 shadow' : 'text-white/80 hover:text-white'}`}
              >EN</button>
              <button
                onClick={() => setChatLang('hi')}
                className={`px-2 py-1 rounded-lg transition ${chatLang === 'hi' ? 'bg-white text-emerald-800 shadow' : 'text-white/80 hover:text-white'}`}
              >हिंदी</button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Message List ── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`group max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => {
                      const lang = chatLang === 'hi' ? 'hi-IN' : 'en-IN';
                      if (ttsSpeaking && activeTtsMsgId === msg.id) {
                        ttsStop();
                        setActiveTtsMsgId(null);
                      } else {
                        setActiveTtsMsgId(msg.id);
                        ttsSpeak(msg.text, lang);
                      }
                    }}
                    className="mt-0.5 ml-1 text-[10px] text-slate-400 hover:text-emerald-600 flex items-center space-x-0.5 transition"
                    title={t('chatbot.readAloud')}
                  >
                    {ttsLoading && activeTtsMsgId === msg.id
                      ? <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                      : <Volume2 className={`w-3 h-3 ${ttsSpeaking && activeTtsMsgId === msg.id ? 'text-emerald-500 animate-pulse' : ''}`} />}
                    <span>
                      {ttsLoading && activeTtsMsgId === msg.id
                        ? 'Generating…'
                        : ttsSpeaking && activeTtsMsgId === msg.id
                        ? t('chatbot.speaking')
                        : t('chatbot.readAloud')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                <div className="flex space-x-1 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested Chips ── */}
        <div className="px-3 pt-2 pb-1 flex-shrink-0 bg-white border-t border-slate-100">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {suggestedChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => sendMessage(chip)}
                disabled={isLoading}
                className="flex-shrink-0 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-full transition disabled:opacity-50 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input Bar ── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 px-3 py-3 bg-white border-t border-slate-200 flex-shrink-0"
        >
          {/* Mic button */}
          <button
            type="button"
            onClick={startListening}
            className={`p-2 rounded-xl flex-shrink-0 transition ${
              isListening
                ? 'bg-red-500 text-white ring-4 ring-red-200 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isListening ? t('chatbot.stopListening') : t('chatbot.startListening')}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); inputRef.current = e.target.value; }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
            placeholder={chatLang === 'hi' ? t('chatbot.placeholderHi') : t('chatbot.placeholderEn')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-0"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !(input && input.trim())}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-40 transition flex-shrink-0 shadow-sm"
            title={t('chatbot.send')}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
