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
import HealthProfileModal from './components/HealthProfileModal';
import AuthModal from './components/AuthModal';

import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MedicinesPage from './pages/MedicinesPage';
import AccessLogPage from './pages/AccessLogPage';
import TrendCharts from './components/TrendCharts';
import DoctorSummaryView from './pages/DoctorSummaryView';
import EmergencyPublicView from './pages/EmergencyPublicView';

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
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
        {simpleMode && activeTab === 'dashboard' ? (
          <SimpleModeHome
            onNavigate={(tab) => {
              if (tab === 'emergency') setEmergencyModalOpen(true);
              else if (tab === 'voice') setVoiceModalOpen(true);
              else if (tab === 'profile') setProfileModalOpen(true);
              else setActiveTab(tab);
            }}
            onOpenEmergency={() => setEmergencyModalOpen(true)}
            onOpenVoice={() => setVoiceModalOpen(true)}
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
          "{t('app.tagline')}" • ABHA Identity Layer Complement • Multilingual English, Hindi & Marathi
        </p>
      </footer>

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
