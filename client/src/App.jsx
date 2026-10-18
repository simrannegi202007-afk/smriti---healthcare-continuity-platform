import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import SimpleModeHome from './components/SimpleModeHome';
import TimelineView from './components/TimelineView';
import ExplainModal from './components/ExplainModal';
import DoctorShareModal from './components/DoctorShareModal';
import EmergencyCardModal from './components/EmergencyCardModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import ChatbotModal from './components/ChatbotModal';
import HealthProfileModal from './components/HealthProfileModal';
import AuthModal from './components/AuthModal';

import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MedicinesPage from './pages/MedicinesPage';
import AccessLogPage from './pages/AccessLogPage';
import TrendCharts from './components/TrendCharts';
import DoctorSummaryView from './pages/DoctorSummaryView';
import EmergencyPublicView from './pages/EmergencyPublicView';

import { Bot } from 'lucide-react';

function MainApp() {
  const { t } = useTranslation();
  const { simpleMode, toggleSimpleMode } = useAuth();
  
  // Navigation tab: 'dashboard', 'timeline', 'upload', 'medicines', 'share', 'access-log'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [explainRecord, setExplainRecord] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check URL pathname for direct public share routes
  const path = window.location.pathname;

  if (path.startsWith('/shared/doctor/')) {
    const token = path.replace('/shared/doctor/', '');
    return <DoctorSummaryView token={token} />;
  }

  if (path.startsWith('/emergency/')) {
    const token = path.replace('/emergency/', '');
    return <EmergencyPublicView token={token} />;
  }

  const openChatbot = () => setChatbotOpen(true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans w-full max-w-full">
      {/* Top Navigation with Smriti Brand & Tagline */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
        onOpenVoice={() => setVoiceModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenChatbot={openChatbot}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
        {/* Chatbot Banner — shown on dashboard and simpleMode */}
        {(activeTab === 'dashboard' || simpleMode) && (
          <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center space-x-2 text-sm font-semibold">
              <Bot className="w-4 h-4 flex-shrink-0" />
              <span>{t('chatbot.bannerText')}</span>
            </div>
            <button
              onClick={openChatbot}
              className="text-xs font-black bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition flex-shrink-0 shadow-sm"
            >
              {t('chatbot.openChat')}
            </button>
          </div>
        )}

        {simpleMode && activeTab === 'dashboard' ? (
          <SimpleModeHome
            onNavigate={(tab) => {
              if (tab === 'emergency') setEmergencyModalOpen(true);
              else if (tab === 'voice') setChatbotOpen(true);
              else if (tab === 'profile') setProfileModalOpen(true);
              else setActiveTab(tab);
            }}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
            onOpenVoice={openChatbot}
            onOpenProfile={() => setProfileModalOpen(true)}
          />
        ) : activeTab === 'dashboard' ? (
          <Dashboard
            onNavigate={setActiveTab}
            onExplain={(rec) => setExplainRecord(rec)}
            onShare={(rec) => setShareModalOpen(true)}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
          />
        ) : activeTab === 'timeline' ? (
          <TimelineView
            onExplain={(rec) => setExplainRecord(rec)}
            onShare={(rec) => setShareModalOpen(true)}
            onNavigateUpload={() => setActiveTab('upload')}
          />
        ) : activeTab === 'upload' ? (
          <UploadPage
            onUploadSuccess={() => setActiveTab('timeline')}
          />
        ) : activeTab === 'medicines' ? (
          <MedicinesPage />
        ) : activeTab === 'trends' ? (
          <div className="max-w-4xl mx-auto px-4 py-8"><TrendCharts /></div>
        ) : activeTab === 'share' ? (
          <DoctorShareModal records={[]} onClose={() => setActiveTab('dashboard')} />
        ) : activeTab === 'access-log' ? (
          <AccessLogPage />
        ) : (
          <Dashboard
            onNavigate={setActiveTab}
            onExplain={(rec) => setExplainRecord(rec)}
            onShare={(rec) => setShareModalOpen(true)}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          🌿 {t('app.name')} — {t('app.subtagline')}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          "{t('app.tagline')}" • ABHA Identity Layer Complement • Multilingual English, Hindi &amp; Marathi
        </p>
      </footer>

      {/* ── Floating Chatbot Button (every page, bottom-right) ── */}
      {!chatbotOpen && (
        <button
          id="smriti-chatbot-fab"
          onClick={openChatbot}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-2xl transition group"
          style={{
            boxShadow: '0 0 0 0 rgba(16,185,129,0.7)',
            animation: 'chatbotPulse 2.5s ease-in-out infinite'
          }}
          title={t('chatbot.floatLabel')}
          aria-label={t('chatbot.floatLabel')}
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-amber-400 text-amber-900 font-black px-1 rounded-full leading-tight">AI</span>
          </div>
          <span className="text-xs font-black whitespace-nowrap">{t('chatbot.floatLabel')}</span>
        </button>
      )}

      {/* Floating Modals */}
      {explainRecord && (
        <ExplainModal
          record={explainRecord}
          onClose={() => setExplainRecord(null)}
        />
      )}

      {shareModalOpen && (
        <DoctorShareModal
          records={[]}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {emergencyModalOpen && (
        <EmergencyCardModal
          onClose={() => setEmergencyModalOpen(false)}
        />
      )}

      {voiceModalOpen && (
        <VoiceAssistantModal
          onClose={() => setVoiceModalOpen(false)}
          onOpenEmergency={() => {
            setVoiceModalOpen(false);
            setEmergencyModalOpen(true);
          }}
        />
      )}

      {chatbotOpen && (
        <ChatbotModal
          onClose={() => setChatbotOpen(false)}
          onOpenEmergency={() => {
            setChatbotOpen(false);
            setEmergencyModalOpen(true);
          }}
        />
      )}

      {profileModalOpen && (
        <HealthProfileModal
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Chatbot pulse animation */}
      <style>{`
        @keyframes chatbotPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
