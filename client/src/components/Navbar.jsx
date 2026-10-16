import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Globe, 
  AlertCircle, 
  Type, 
  Mic, 
  Menu, 
  X, 
  Layers, 
  HeartHandshake, 
  Activity,
  FileText,
  Clock,
  LogOut,
  Pill,
  Share2
} from 'lucide-react';

export default function Navbar({ onOpenEmergency, onOpenVoice, activeTab, setActiveTab }) {
  const { t } = useTranslation();
  const { user, profile, simpleMode, toggleSimpleMode, fontSize, updateFontSize, language, changeLanguage, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'en', label: 'English' }
  ];

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Activity },
    { id: 'timeline', label: t('nav.timeline'), icon: Clock },
    { id: 'upload', label: t('nav.upload'), icon: FileText },
    { id: 'medicines', label: t('nav.medicines'), icon: Pill },
    { id: 'share', label: t('nav.share'), icon: Share2 },
    { id: 'access-log', label: t('nav.accessLog'), icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner / ABHA Status Strip */}
      <div className="bg-teal-700 text-white px-4 py-1 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500 text-white">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {t('app.abhaLinked')}
          </span>
          <span className="hidden sm:inline text-teal-100">{t('app.abhaNumber')}</span>
        </div>
        <div className="flex items-center space-x-3 text-teal-100 text-[11px]">
          <span>{t('app.demoPatient')}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">{t('app.name')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  {language === 'mr' ? 'स्मृती' : language === 'hi' ? 'स्मृति' : 'Continuity'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 -mt-0.5">{t('app.tagline')}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-teal-50 text-teal-700 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Mode Toggle, Font Size, Language, Voice & Emergency */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Simple Mode Toggle */}
            <button
              onClick={toggleSimpleMode}
              title="Toggle between Simple and Detailed View"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow-sm ${
                simpleMode 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">{simpleMode ? t('nav.simpleMode') : t('nav.standardMode')}</span>
              <span className="md:hidden">{simpleMode ? 'Simple' : 'Full'}</span>
            </button>

            {/* Font Size A- / A / A+ */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => updateFontSize('sm')}
                className={`px-2 py-1 rounded font-medium ${fontSize === 'sm' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-600'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => updateFontSize('md')}
                className={`px-2 py-1 rounded font-medium ${fontSize === 'md' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-600'}`}
                title="Standard text"
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('lg')}
                className={`px-2 py-1 rounded font-bold ${fontSize === 'lg' ? 'bg-white shadow text-teal-700 font-black' : 'text-slate-600'}`}
                title="Large text for seniors"
              >
                A+
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'EN'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition ${
                        language === l.code ? 'font-bold text-teal-700 bg-teal-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <span className="text-teal-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Assistant Mic Button */}
            <button
              onClick={onOpenVoice}
              title="Smriti Voice Assistant"
              className="p-2 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition"
            >
              <Mic className="w-4 h-4 text-teal-600" />
            </button>

            {/* Emergency QR Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition animate-pulse"
              title="Open Life-Saving Emergency Card & QR"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.emergency')}</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
